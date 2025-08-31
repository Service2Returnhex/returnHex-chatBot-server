import { Request, Response } from "express";
import { replyToComment, sendMessage } from "../../api/facebook.api";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";
import { Post } from "../Page/post.mode";
import { downloadImageBuffer, sendTyping } from "./image.detection";
import {
  cosineSimilarity,
  createTextEmbedding,
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

    try {
      await sendTyping(senderId, true);

      // 1) compute user embedding
      const buf = await downloadImageBuffer(imageUrl);
      const ocrText = await extractTextFromImageBuffer(buf);
      const textForEmbedding = ocrText && ocrText.length > 5 ? ocrText : ""; // small text fallback
      // If OCR gives little/none text, you could optionally send the image through a vision LLM or use CLIP
      if (!textForEmbedding) {
        // optional: also try using the incoming message text (if user wrote something with the image)
        // or fallback to using pHash approach if desired
      }
      const userEmbedding = textForEmbedding
        ? await createTextEmbedding(textForEmbedding)
        : null;

      if (!userEmbedding) {
        // fallback: we couldn't get semantic text representation — reply fallback
        await sendMessage(
          senderId,
          shopId,
          "আপনার ছবির টেক্সট আমরা বুঝতে পারিনি — অনুগ্রহ করে ছবির সঙ্গে কিছু লিখে পাঠান বা 'Talk to human' চাপুন।"
        );
        await sendTyping(senderId, false);
        return;
      }

      // 2) retrieve candidate posts for this page (only those with embedding)
      const posts = await Post.find({
        shopId,
        embedding: { $exists: true, $ne: [] },
      })
        .lean()
        .exec();
      console.log("posts", posts);
      if (!posts || posts.length === 0) {
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, এখনই কোন পণ্যের তথ্যও পাওয়া যাচ্ছে না।"
        );
        await sendTyping(senderId, false);
        return;
      }

      // 3) compute best similarity (linear scan)
      let best: { post: any; score: number } | null = null;
      for (const p of posts) {
        if (!p.embedding || !Array.isArray(p.embedding)) continue;
        const score = cosineSimilarity(userEmbedding, p.embedding);
        if (!best || score > best.score) best = { post: p, score };
      }

      console.log("best match score:", best?.score);
      if (best && best.score >= SIMILARITY_THRESHOLD) {
        const matched = best.post;
        const reply = `আমি মিল পেয়েছি:\n\n${
          matched.message || "(No caption)"
        }\n\nPost ID: ${matched.postId}\nSimilarity: ${best.score.toFixed(
          3
        )}\nআপনি কি এটি দেখতে চান / কার্টে যোগ করতে চান?`;
        await sendMessage(senderId, shopId, reply);
      } else {
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, কোন ম্যাচ পাওয়া যায়নি। 'Show similar' বা 'Talk to human' বেছে নিন।"
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

export const handleAddFeed = async (value: any, pageId: string) => {
  try {
    const imageUrl = value.link || value.full_picture || value.picture || null;
    let embedding: number[] | null = null;

    if (imageUrl) {
      try {
        const buf = await downloadImageBuffer(imageUrl);
        const ocrText = await extractTextFromImageBuffer(buf);
        // prefer OCR text; if none, fall back to caption/message
        const textForEmbedding =
          ocrText && ocrText.length > 10 ? ocrText : value.message || "";
        if (textForEmbedding && textForEmbedding.trim().length > 0) {
          embedding = await createTextEmbedding(textForEmbedding);
        }
      } catch (err: any) {
        console.warn("Image embedding compute failed:", err?.message || err);
      }
    }
    console.log("embedding", embedding);
    const payload: any = {
      postId: value.post_id,
      shopId: pageId,
      message: value.message,
      createdAt: value.created_time,
      full_picture: imageUrl,
    };
    if (embedding) payload.embedding = embedding;

    const result = await Post.findOneAndUpdate(
      { postId: value.post_id },
      { $set: payload },
      { upsert: true, new: true }
    ).exec();

    if (!result) console.log("Feed Not Created");
    else
      console.log(
        "Feed Created/Updated Successfully",
        result.postId,
        "embedding:",
        !!result.embedding
      );
  } catch (error: any) {
    console.log("Feed Not Created, Error: ", error?.message);
  }
};

const handleEditFeed = async (value: any, pageId: string) => {
  const { post_id, message } = value;
  try {
    const result = await PageService.updateProduct(pageId, post_id, {
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
  try {
    const result = await PageService.deleteProduct(pageId, post_id);
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
