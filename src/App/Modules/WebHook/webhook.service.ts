import { AxiosError } from "axios";
import { Request, Response } from "express";
import { replyToComment, sendMessage } from "../../api/facebook.api";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";
import { PageInfo } from "../Page/pageInfo.model";
import { Post } from "../Page/post.mode";
import { fetchPostAttachments } from "./image.caption";
import { sendTyping } from "./image.detection";
import {
  averageEmbeddings,
  cosineSimilarity,
  createTextEmbedding,
  downloadImageBuffer,
  extractImageCaptions,
  extractImageUrlsFromFeed,
  extractTextFromImageBuffer,
} from "./image.embedding";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

const SIMILARITY_THRESHOLD = 0.5;

export const handleDM = async (
  event: any,
  shopId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  const senderId = event.sender?.id;
  if (!senderId) return;
  if (event.message?.is_echo) return;

  const userMsg = event.message?.text || "";
  console.log("💬 DM Message:", userMsg);

  if (event.message?.attachments && event.message.attachments.length > 0) {
    const att = event.message.attachments[0];
    const imageUrl = att.payload?.url;
    if (!imageUrl) {
      await sendMessage(
        senderId,
        shopId,
        "ইমেজ URL পাওয়া যায়নি — আবার পাঠান দয়া করে।"
      );
      return;
    }

    // CONFIG
    // const SIMILARITY_THRESHOLD = 0.7; // তোমার প্রয়োজনে 0.65-0.80 এ অ্যাডজাস্ট করো

    // Replace your try { ... } block with this updated version
    try {
      await sendTyping(senderId, true);

      const shop = await PageInfo.findOne({ shopId });
      const pageAccessToken = shop?.accessToken || "";

      // 1) compute user embedding from image OCR
      const buf = await downloadImageBuffer(imageUrl, pageAccessToken);
      let ocrText = "";
      try {
        ocrText = (await extractTextFromImageBuffer(buf)) || "";
      } catch (ocrErr) {
        console.warn("OCR failed:", (ocrErr as any)?.message || ocrErr);
        ocrText = "";
      }
      const userText = ocrText.trim();
      const userEmb = userText ? await createTextEmbedding(userText) : null;

      if (!userEmb || !Array.isArray(userEmb) || userEmb.length === 0) {
        await sendMessage(
          senderId,
          shopId,
          "আপনার ছবির টেক্সট থেকে আমরা কোন সেমান্টিক রিপ্রেজেন্টেশন পাইনি — অনুগ্রহ করে ছবির সাথে কিছু লেখা পাঠান বা 'Talk to human' বেছে নিন।"
        );
        return;
      }

      // 2) fetch posts for the page
      const posts = await Post.find({ shopId }).lean().exec();
      if (!posts || posts.length === 0) {
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, এখনই কোন পণ্যের তথ্য পাওয়া যাচ্ছে না।"
        );
        return;
      }

      // 3) search best match: prefer per-image embedding, fallback to per-image caption embedding (on-the-fly),
      //    then fallback to post.aggregatedEmbedding
      let best: {
        post: any;
        image?: any | null;
        score: number;
        matchedBy: "imageEmbedding" | "imageCaptionEmbedding" | "postEmbedding";
      } | null = null;

      // cache for caption embeddings to avoid duplicate createTextEmbedding calls
      const captionEmbCache = new Map<string, number[] | null>();

      for (const post of posts) {
        const images = Array.isArray(post.images) ? post.images : [];

        // 3a): try image-level embeddings first (fast path)
        for (const img of images) {
          // if image stored explicit embedding
          if (
            img?.embedding &&
            Array.isArray(img.embedding) &&
            img.embedding.length
          ) {
            const score = cosineSimilarity(userEmb, img.embedding);
            if (!best || score > best.score) {
              best = { post, image: img, score, matchedBy: "imageEmbedding" };
            }
          }
        }

        // 3b) if not matched by stored image embeddings, try per-image caption embeddings (on-demand)
        for (const img of images) {
          if (
            img?.embedding &&
            Array.isArray(img.embedding) &&
            img.embedding.length
          ) {
            // we already handled stored embeddings above
            continue;
          }

          const caption = (img?.caption || "").toString().trim();
          if (!caption) continue;

          // get or compute caption embedding
          if (!captionEmbCache.has(caption)) {
            try {
              const emb = await createTextEmbedding(caption);
              const normalized = Array.isArray(emb) && emb.length ? emb : null;
              captionEmbCache.set(caption, normalized);
            } catch (e) {
              console.warn(
                "caption embedding failed:",
                (e as any)?.message || e
              );
              captionEmbCache.set(caption, null);
            }
          }

          const captionEmb = captionEmbCache.get(caption) || null;
          if (!captionEmb) continue;

          const score = cosineSimilarity(userEmb, captionEmb);
          if (!best || score > best.score) {
            best = {
              post,
              image: img,
              score,
              matchedBy: "imageCaptionEmbedding",
            };
          }
        }

        // 3c) fallback: compare with post-level aggregatedEmbedding if exists
        if (
          (!best || best.matchedBy === "postEmbedding") &&
          post?.aggregatedEmbedding &&
          Array.isArray(post.aggregatedEmbedding) &&
          post.aggregatedEmbedding.length
        ) {
          const score = cosineSimilarity(userEmb, post.aggregatedEmbedding);
          if (!best || score > best.score) {
            best = { post, image: null, score, matchedBy: "postEmbedding" };
          }
        }
      } // end posts loop

      console.log("best match:", best);

      if (best && best.score >= SIMILARITY_THRESHOLD) {
        const matchedPost = best.post;
        // prefer image-level caption if we've matched an image
        const imageCaption = best.image?.caption ?? null;
        const replyText =
          imageCaption && imageCaption.toString().trim()
            ? `আমি মিল পেয়েছি (image caption):\n\n${imageCaption}\n\nPost ID: ${
                matchedPost.postId
              }\nSimilarity: ${best.score.toFixed(3)}`
            : `আমি মিল পেয়েছি (post message):\n\n${
                matchedPost.message || "(No caption)"
              }\n\nPost ID: ${
                matchedPost.postId
              }\nSimilarity: ${best.score.toFixed(3)}`;

        await sendMessage(senderId, shopId, replyText);
      } else {
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, কোন মিল পাওয়া যায়নি। 'Show similar' বা 'Talk to human' বেছে নিন।"
        );
      }
    } catch (err: any) {
      console.error("Image compare error:", err?.message || err);
      await sendMessage(
        senderId,
        shopId,
        "ইমেজ বিশ্লেষণে ত্রুটি হয়েছে — পরে চেষ্টা করুন বা 'Talk to human' নিন।"
      );
    } finally {
      await sendTyping(senderId, false);
    }

    return;
  }

  let reply = "";
  try {
    if (method === "gemini") {
      reply = await GeminiService.getResponseDM(
        senderId,
        shopId,
        userMsg,
        ActionType.DM
      );
    } else if (method === "chatgpt") {
      reply = await ChatgptService.getResponseDM(
        senderId,
        shopId,
        userMsg,
        ActionType.DM
      );
    } else if (method === "deepseek") {
      reply = await DeepSeekService.getResponseDM(
        senderId,
        shopId,
        userMsg,
        ActionType.DM
      );
    } else if (method === "groq") {
      reply = await GroqService.getResponseDM(
        senderId,
        shopId,
        userMsg,
        ActionType.DM
      );
    }
  } catch (error: any) {
    console.log("Error generating reply:", error?.message);
  }

  try {
    await sendMessage(senderId, shopId, reply);
  } catch (error: any) {
    console.log("Error sending reply:", error?.message);
  }
};

// create Post
export const handleAddFeed = async (value: any, pageId: string) => {
  try {
    const shop = await PageInfo.findOne({ shopId: pageId });
    if (!shop) {
      console.warn("handleAddFeed: PageInfo not found for", pageId);
      return;
    }
    const pageAccessToken = shop.accessToken || "";
    if (!pageAccessToken) {
      console.warn("handleAddFeed: No page access token for", pageId);
      return;
    }
    const postId = String(value.post_id || value.id || "");
    if (!postId) {
      console.warn("handleAddFeed: no post_id in webhook value", value);
      return;
    }
    // 1) fetch post attachments (to get per-image captions via subattachments)
    let postData: any = null;
    try {
      postData = await fetchPostAttachments(postId, pageAccessToken);
    } catch (err: any) {
      console.warn("fetchPostAttachments failed:", err?.message || err);
      // continue — we'll still try fallback with value.photos
    }
    // console.log("postData", postData.attachments.data);
    // console.log(
    //   "postData image",
    //   postData.attachments.data[0].media.subattachments.data[0]
    // );
    const attachments = Array.isArray(postData)
      ? postData
      : postData &&
        postData.attachments &&
        Array.isArray(postData.attachments.data)
      ? postData.attachments.data
      : [];

    // 4) safe subattachment access
    const firstSub = attachments[0]?.subattachments?.data?.[0] ?? null;

    // console.log("attachments (length):", attachments.length);
    // console.log(
    //   "first attachment (pretty):",
    //   JSON.stringify(attachments[0] || null, null, 2)
    // );
    console.log(
      "first subattachment (pretty):",
      JSON.stringify(firstSub, null, 2)
    );
    // 2) extract image captions from Graph response (if available)

    const imagesDescription = postData
      ? await extractImageCaptions(postData)
      : ([] as { photoId?: string; url?: string; caption?: string }[]);

    console.log("imagesDescription", imagesDescription);

    const urlToCaption = new Map<string, string>();
    const idToCaption = new Map<string, string>();

    imagesDescription.forEach((it: any) => {
      if (it.url) urlToCaption.set(it.url, it.caption ?? "");
      if (it.photoId) idToCaption.set(String(it.photoId), it.caption ?? "");
    });

    // 3) extract image URLs from webhook `value` (fallback if Graph not available)
    const imageUrls: string[] = extractImageUrlsFromFeed(value) || [];

    // If no imageUrls found in webhook, try to collect from postData attachments
    if (imageUrls.length === 0 && imagesDescription?.length > 0) {
      // take URLs from imagesDescription
      for (const it of imagesDescription) {
        if (it.url) imageUrls.push(it.url);
      }
    }
    // console.log("Found imageUrls:", imageUrls);
    // If still empty, nothing to process
    if (imageUrls.length === 0) {
      console.log("handleAddFeed: no image URLs found for", postId);
    }

    // 4) process each image: download, OCR (optional), create embedding
    type ImageResult = {
      url: string;
      photoId?: string | null;
      caption?: string | null;
      embedding?: number[] | null;
    };

    // process each image concurrently with limit (to avoid too many parallel requests)
    const imagesProcessed: ImageResult[] = [];
    const CONCURRENCY = 6; // safe default
    // split into chunks for concurrency control
    for (let i = 0; i < imageUrls.length; i += CONCURRENCY) {
      const chunk = imageUrls.slice(i, i + CONCURRENCY);
      const promises: Promise<ImageResult>[] = chunk.map(
        async (url): Promise<ImageResult> => {
          try {
            // find matching caption (exact URL match)
            let caption: string | null = null;
            if (urlToCaption.has(url)) {
              caption = urlToCaption.get(url) || null;
            } else {
              // try fuzzy match: some Graph URLs may differ by params — match by pathname or last segment
              const matched = Array.from(urlToCaption.keys()).find((u) => {
                try {
                  const a = new URL(u).pathname;
                  const b = new URL(url).pathname;
                  return a === b || a.endsWith(b) || b.endsWith(a);
                } catch (e) {
                  return u === url;
                }
              });
              if (matched) caption = urlToCaption.get(matched) || null;
            }

            // try to discover photoId by scanning imagesDescription entries
            // let photoId: string | null = null;
            // const cd = imagesDescription.find(
            //   (d) =>
            //     d.url === url ||
            //     d.url?.includes(url) ||
            //     (d.photoId && url.includes(d.photoId))
            // );
            // console.log("photo id ", cd?.photoId);
            // if (cd?.photoId) photoId = String(cd.photoId);

            let emb: number[] | null = null;
            try {
              // download image into buffer (pass pageToken if needed)
              const buf = await downloadImageBuffer(url, pageAccessToken);
              // console.log("buf", buf);

              // optional OCR (non-fatal)
              let ocrText = "";

              try {
                ocrText = (await extractTextFromImageBuffer(buf)) || "";
                // console.log("ocrText", ocrText);
              } catch (ocrErr) {
                const err = ocrErr as AxiosError<{ message: string }>;
                console.warn("OCR failed for", url, err?.message || ocrErr);
                ocrText = "";
              }
              const textForEmbedding =
                [ocrText, value.message].filter(Boolean).join("\n").trim() ||
                "image";
              emb = await createTextEmbedding(textForEmbedding);
              // console.log("emb", emb);
              // return emb ;
            } catch (err: any) {
              console.warn(
                "Failed processing image url:",
                url,
                err?.message || err
              );
            }

            return {
              url,
              // photoId: photoId ?? null,
              caption: caption ?? null,
              embedding: emb ?? undefined,
            };
          } catch (err: any) {
            console.warn("Failed processing image:", url, err?.message || err);
            return { url, photoId: null, caption: null, embedding: null };
          }
        }
      );

      const results = await Promise.all(promises);
      imagesProcessed.push(...results);
      console.log("imagesProcessed", imagesProcessed);
    }

    // 5) aggregated embedding (mean of non-null embeddings)
    const embeddingsList = imagesProcessed
      .map((it) => it.embedding)
      .filter((e): e is number[] => Array.isArray(e) && e.length > 0);

    const aggregatedEmbedding = embeddingsList.length
      ? averageEmbeddings(embeddingsList)
      : [];

    // 6) prepare payload & upsert to DB
    const payload: any = {
      postId,
      shopId: pageId,
      message: (postData?.message || value.message || "") as string,
      createdAt: value.created_time
        ? new Date(value.created_time * 1000)
        : new Date(),
      updatedAt: new Date(),
      images: imagesProcessed.map((it) => ({
        // photoId: it.photoId,
        url: it.url,
        caption: it.caption,
        // don't store raw embeddings per-image to DB here unless you want them:
        embedding: it.embedding ?? undefined,
      })),
    };

    if (aggregatedEmbedding.length)
      payload.aggregatedEmbedding = aggregatedEmbedding;

    // Persist: use PageService.createProduct (or adapt to your Post model)
    const result = await PageService.createProduct(payload);

    if (!result) {
      console.warn("handleAddFeed: createProduct returned falsy for", postId);
    } else {
      console.log(
        "handleAddFeed: saved post",
        postId,
        "images:",
        payload.images.length
      );
    }

    return result;
  } catch (err: any) {
    console.error("handleAddFeed: unexpected error:", err?.message || err);
    // Do not throw — webhook should return 200, but you can rethrow if you want failure visibility
    return null;
  }
};

const handleEditFeed = async (value: any, pageId: string) => {
  const { post_id, message } = value;
  // console.log("update value", value);
  try {
    const result = await PageService.updateProduct(value.from.id, post_id, {
      message,
      updatedAt: new Date(),
    });
    !result
      ? console.log("Feed Not Updated")
      : console.log("Feed Updated Successfully");
  } catch (error: any) {
    console.log("Feed Not Updated, Error: ", error?.message);
  }
};

const handleRemoveFeed = async (value: any, pageId: string) => {
  const { post_id } = value;
  console.log("remove value", value);
  try {
    const result = await PageService.deleteProduct(value.from.id, post_id);
    const result1 = await CommentHistory.findOneAndDelete({ postId: post_id });
    !result
      ? console.log("Feed Not Deleted")
      : console.log("Feed Deleted Successfully");
    !result1
      ? console.log("Comment History Not Deleted")
      : console.log("Comment History Deleted Successfully");
  } catch (error: any) {
    console.log(
      "Feed Not Deleted\nComment History Not Deleted\nError: ",
      error.message
    );
  }
};

const handleAddComment = async (value: any, pageId: string, method: string) => {
  const { comment_id, message, post_id, from } = value;
  const commenterId = from?.id;
  const userName = from?.name;
  if (!value.message) {
    console.log("📎 Attachment detected in comment!");
    await replyToComment(
      comment_id,
      pageId,
      "সংযুক্তি বা ভিডিও, ছবি, ফাইল এখনও অনুমোদিত নয়। আমাদের কাস্টমার সার্ভিস আপনার সাথে যোগাযোগ করবে।\nAttachments or videos, images, files are not allowed yet. Our customer service will contact you.",
      commenterId
    );
    return;
  }

  console.log(commenterId, pageId);
  if (commenterId === pageId) {
    console.log("⛔ Skipping own comment to avoid infinite loop.");
    return;
  }
  console.log("💬 New Comment:", message);

  let reply = "";

  try {
    if (method === "gemini") {
      reply = await GeminiService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    } else if (method === "chatgpt") {
      reply = await ChatgptService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    } else if (method === "deepseek") {
      reply = await DeepSeekService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    } else {
      reply = await GroqService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    }
  } catch (err: any) {
    console.log("Error generating Comment Replay:", err.message);
  }

  try {
    await replyToComment(comment_id, pageId, reply as string, commenterId);
  } catch (error: any) {
    console.log("Error Sending Comment Replay: ", error?.message);
  }
};

const handleEditComment = async (value: any, pageId: string) => {
  const { comment_id, message } = value;
  try {
    const result = await CommentHistory.findOneAndUpdate(
      { "messages.commentId": comment_id },
      {
        $set: {
          "messages.$.content": message,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    !result
      ? console.log("Comment Not Updated")
      : console.log("Comment Updated Successfully");
  } catch (error: any) {
    console.log("Comment Not Updated, Error: ", error?.message);
  }
};

const handleRemoveComment = async (value: any, pageId: string) => {
  const { comment_id } = value;
  try {
    const result = await CommentHistory.findOneAndUpdate(
      { "messages.commentId": comment_id },
      {
        $pull: { messages: { commentId: comment_id } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    !result
      ? console.log("Comment Not Deleted")
      : console.log("Comment Deleted Successfully");
  } catch (error: any) {
    console.log("Comment Not Deleted, Error: ", error?.message);
  }
};

const handleIncomingMessages = async (
  req: Request,
  res: Response,
  pageId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  if (req.body.object !== "page") {
    return "Reply Not Bot Working";
  }

  for (const entry of req.body.entry) {
    const event = entry.messaging?.[0];

    if (event?.message) {
      handleDM(event, pageId, method);
      continue;
    }

    const changes = entry.changes || [];
    for (const change of changes) {
      const { field, value } = change;
      // console.log("Feed Change:", JSON.stringify(change, null, 2));
      if (
        field === "feed" &&
        ["post", "photo", "video", "status"].includes(value.item)
      ) {
        if (value.verb === "add") {
          handleAddFeed(value, pageId);
        } else if (value.verb === "edited") {
          handleEditFeed(value, pageId);
        } else if (value.verb === "remove") {
          handleRemoveFeed(value, pageId);
        }
      }

      if (field === "feed" && value.item === "comment") {
        if (value.verb === "add") {
          handleAddComment(value, pageId, method);
        } else if (value.verb === "edited") {
          handleEditComment(value, pageId);
        } else if (value.verb === "remove") {
          handleRemoveComment(value, pageId);
        }
      }
    }
  }

  return "Reply Bot Working";
};

export const WebHookService = {
  handleIncomingMessages,
};
