import { Request, Response } from "express";
import { replyToComment, sendMessage } from "../../api/facebook.api";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

const handleDM = async (
  event: any,
  pageId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  const senderId = event.sender.id;
  const userMsg = event.message.text;
  console.log("💬 DM Message:", userMsg);
  if(event.message.attachments) {
    console.log("📎 Attachment detected!");
    await sendMessage(senderId, pageId, "Attachments or voices, videos, images, files are not allowed yet.");
    return;
  }

  let reply = "";
  try {
    if (method === "gemini") {
      reply = await GeminiService.getResponseDM(
        senderId,
        pageId,
        userMsg,
        ActionType.DM
      );
    } else if (method === "chatgpt") {
      reply = await ChatgptService.getResponseDM(
        senderId,
        pageId,
        userMsg,
        ActionType.DM
      );
    } else if (method === "deepseek") {
      reply = await DeepSeekService.getResponseDM(
        senderId,
        pageId,
        userMsg,
        ActionType.DM
      );
    } else if (method === "groq") {
      reply = await GroqService.getResponseDM(
        senderId,
        pageId,
        userMsg,
        ActionType.DM
      );
    }
  } catch (error: any) {
    console.log("Error generating reply:", error?.message);
  }

  try {
    await sendMessage(senderId, pageId, reply);
  } catch (error: any) {
    console.log("Error sending reply:", error?.message);
  }
};

const handleAddFeed = async (value: any, pageId: string) => {
  try {
    const result = await PageService.createProduct({
      postId: value.post_id,
      message: value.message,
      shopId: pageId,
      createdAt: value.created_time,
      full_picture: value.full_picture,
    });

    !result
      ? console.log("Feed Not Created")
      : console.log("Feed Created Successfully");
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
  if(!value.message) {
    console.log("📎 Attachment detected in comment!");
    await replyToComment(comment_id, pageId, "Attachments or videos, images, files are not allowed yet.");
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
    await replyToComment(comment_id, pageId, reply as string);
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
