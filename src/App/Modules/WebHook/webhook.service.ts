import { AxiosError } from "axios";
import { Request, Response } from "express";
import { replyToComment } from "../../api/facebook.api";
import { fetchPostAttachments } from "../../utility/image.caption";
import { averageEmbeddings, computeHashFromBuffer, createTextEmbedding, downloadImageBuffer, extractImageCaptions, extractImageUrlsFromFeed, extractTextFromImageBuffer } from "../../utility/image.embedding";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";
import { PageInfo } from "../Page/pageInfo.model";
import { handleAddFeed } from "./weebhook.add.feed";
import { handleDM } from "./weebhook.dm.msg";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

const handleEditFeed = async (value: any, pageId: string) => {
  const { post_id, message } = value;
  // console.log("update value", value);

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
      phash: string | null;
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

            let emb: number[] | null = null;
            let phash = "";
            try {
              // download image into buffer (pass pageToken if needed)
              const buf = await downloadImageBuffer(url, pageAccessToken);
              phash = await computeHashFromBuffer(buf);
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
              phash,
              caption: caption ?? null,
              embedding: emb ?? undefined,
            };
          } catch (err: any) {
            console.warn("Failed processing image:", url, err?.message || err);
            return {
              url,
              photoId: null,
              phash: null,
              caption: null,
              embedding: null,
            };
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
        phash: it.phash,
        url: it.url,
        caption: it.caption,
        // don't store raw embeddings per-image to DB here unless you want them:
        embedding: it.embedding ?? undefined,
      })),
    };

    if (aggregatedEmbedding.length)
      payload.aggregatedEmbedding = aggregatedEmbedding;

    // Persist: use PageService.createProduct (or adapt to your Post model)
    const result = await PageService.updateProduct(payload);

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


  // try {
  //   const result = await PageService.updateProduct(value.from.id, post_id, {
  //     message,
  //     updatedAt: new Date(),
  //   });
  //   !result
  //     ? console.log("Feed Not Updated")
  //     : console.log("Feed Updated Successfully");
  // } catch (error: any) {
  //   console.log("Feed Not Updated, Error: ", error?.message);
  // }
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
    // console.log("event",event);

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
