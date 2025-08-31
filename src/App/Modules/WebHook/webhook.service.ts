import { Request, Response } from "express";
import { replyToComment, sendMessage } from "../../api/facebook.api";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";
import { Post } from "../Page/post.mode";
import {
  computeHashFromBuffer,
  downloadImageBuffer,
  HAMMING_THRESHOLD,
  hammingDistanceGeneric,
  sendTyping,
} from "./image.detection";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

const handleDM = async (
  event: any,
  shopId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  const senderId = event.sender.id;
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

      // 1) compute user image hash (in-memory)
      const userBuf = await downloadImageBuffer(imageUrl);
      const userHash = await computeHashFromBuffer(userBuf);

      // 2) get all shop posts for this page (only posts with hash)
      const posts = await Post.find({
        shopId,
        imageHash: { $exists: true, $ne: "" },
      })
        .lean()
        .exec();

      console.log("posts", posts);

      // 3) find best match
      let best: any = null;
      for (const p of posts) {
        if (!p.imageHash) continue;
        const dist = hammingDistanceGeneric(userHash, p.imageHash);
        if (!best || dist < best.distance) best = { post: p, distance: dist };
      }
      console.log("best", best);

      if (best && best.distance <= HAMMING_THRESHOLD) {
        // match found — send post caption / details to user
        const matched = best.post;
        const reply = `আমি মিল পেয়েছি:\n\n${
          matched.message || "(No caption)"
        }\n\nPost ID: ${
          matched.postId
        }\nআপনি কি এটি দেখতে চান / কার্টে যোগ করতে চান?`;
        await sendMessage(senderId, shopId, reply);
      } else {
        // no match
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, কোন ম্যাচ পাওয়া যায়নি। 'Show similar' দেখতে চান অথবা একজন এজেন্টের সাথে যুক্ত হব?"
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

const handleAddFeed = async (value: any, pageId: string) => {
  try {
    // value.link বা value.full_picture বা value.picture — আপনার FB payload অনুযায়ী ঠিক করুন
    const imageUrl = value.link || value.full_picture || value.picture || null;
    console.log("imgUrl", imageUrl);
    let imageHash = "";
    if (imageUrl) {
      try {
        const buf = await downloadImageBuffer(imageUrl);
        console.log("buf", buf);
        imageHash = await computeHashFromBuffer(buf);
        console.log("imgHash", imageHash);
      } catch (err: any) {
        console.warn("Image hash compute failed:", err?.message || err);
      }
    }

    const payload = {
      postId: value.post_id,
      message: value.message,
      shopId: pageId,
      createdAt: value.created_time,
      full_picture: imageUrl,
      imageHash,
    };

    // Save to DB (update if exists)
    const result = await Post.findOneAndUpdate(
      { postId: value.post_id },
      { $set: { ...payload, pageId } },
      { upsert: true, new: true }
    ).exec();

    if (!result) console.log("Feed Not Created");
    else
      console.log(
        "Feed Created/Updated Successfully",
        result.postId,
        "hash:",
        result.imageHash
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
