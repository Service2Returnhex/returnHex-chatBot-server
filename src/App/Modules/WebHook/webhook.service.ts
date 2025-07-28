import { Request, Response } from "express";
import { GeminiService } from "../Gemini/gemini.service";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { PageService } from "../Page/page.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { replyToComment, sendMessage } from "../../api/facebook.api";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GroqService } from "../Groq/grok.service";

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

  const reply =
    method === "gemini"
      ? await GeminiService.getResponseDM(senderId, pageId, userMsg, ActionType.DM)
      : method === "chatgpt"
      ? await ChatgptService.getResponseDM(senderId, pageId,  userMsg, ActionType.DM)
      : method === 'deepseek'
      ? await DeepSeekService.getResponseDM(senderId, pageId,  userMsg, ActionType.DM)
      : await GroqService.getResponseDM(senderId, pageId,  userMsg, ActionType.DM)
      //paid
  await sendMessage(senderId, pageId, reply as string);
};

const handleAddFeed = async (value: any, pageId: string) => {
  const result = await PageService.createProduct({
    postId: value.post_id,
    message: value.message,
    shopId: pageId,
    createdAt: value.created_time,
  });

  !result
    ? console.log("Feed Not Created")
    : console.log("Feed Created Successfully");
};

const handleEditFeed = async (value: any, pageId: string) => {
  const { post_id, message } = value;
  const result = await PageService.updateProduct( pageId, post_id, {
    message,
    updatedAt: new Date(), 
  });

  !result
    ? console.log("Feed Not Updated")
    : console.log("Feed Updated Successfully");
};

const handleRemoveFeed = async (value: any, pageId: string) => {
  const { post_id } = value;
  const result = await PageService.deleteProduct(pageId, post_id);
  await CommentHistory.findOneAndDelete({ postId: post_id });
  !result
    ? console.log("Feed Not Deleted")
    : console.log("Feed Deleted Successfully");
};

const handleAddComment = async (value: any, pageId: string, method: string) => {
  const { comment_id, message, post_id, from } = value;
  const commenterId = from?.id;
  const userName = from?.name;

  console.log(commenterId, pageId);
  if (commenterId === pageId) {
    console.log("⛔ Skipping own comment to avoid infinite loop.");
    return;
  }
  console.log("💬 New Comment:", message);

  const reply =
    method === "gemini" 
      ? await GeminiService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          pageId,
          ActionType.COMMENT
        )
      : method === "chatgpt"
      ? await ChatgptService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          pageId,
          ActionType.COMMENT
        )
      : method === 'deepseek'
      ? await DeepSeekService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          pageId,
          ActionType.COMMENT
        )
      : await GroqService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          pageId,
          ActionType.COMMENT);

  await replyToComment(comment_id, pageId, reply as string);
};

const handleEditComment = async (value: any, pageId: string) => {
  const { comment_id, message } = value;
  console.log(comment_id);
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
};

const handleRemoveComment = async (value: any, pageId: string) => {
  const { comment_id } = value;

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
