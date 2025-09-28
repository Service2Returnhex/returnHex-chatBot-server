import { Request, Response } from "express";
import { replyToComment } from "../../api/facebook.api";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";
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
