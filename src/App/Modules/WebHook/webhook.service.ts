// src/App/Modules/Webhook/webhook.service.ts

import { Request, Response } from "express";
import { replyToComment, sendMessage } from "../../utility/facebookApi";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-history.model";
import { DeepSeekService } from "../Deepseek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GrokService } from "../Grok/grok.service";
import { PageService } from "../Page/page.service";
import { Product } from "../Page/product.mode";
import { ShopInfo } from "../Page/shopInfo.model";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

type AIMethod = "gemini" | "chatgpt" | "deepseek" | "grok";

async function handleDM(event: any, method: AIMethod) {
  const senderId = event.sender.id;
  const userMsg = event.message?.text;
  if (!userMsg) return;

  console.log("💬 DM Message:", userMsg);

  // history
  let chat = await ChatHistory.findOne({ userId: senderId });
  if (!chat) chat = new ChatHistory({ userId: senderId, messages: [] });

  chat.messages.push({ role: "user", content: userMsg });

  // build system prompt
  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  const products = await Product.find();
  const systemPrompt = `You are a helpful assistant for the shop "${shop?.pageName}".`;

  // call AI
  let reply: string;
  switch (method) {
    case "gemini":
      reply = await GeminiService.getResponse(senderId, userMsg, ActionType.DM);
      break;
    case "chatgpt":
      reply = await ChatgptService.getResponse(
        senderId,
        userMsg,
        ActionType.DM
      );
      break;
    case "deepseek":
      reply = await DeepSeekService.getResponseDM(
        senderId,
        userMsg,
        ActionType.DM
      );
      break;
    case "grok":
      reply = await GrokService.getResponse(senderId, userMsg, ActionType.DM);
      break;
    default:
      reply = "Sorry, I don't know how to answer that.";
  }

  console.log("reply", reply);
  const replyText =
    reply.choices?.[0]?.message?.content?.trim() ||
    "Sorry, I couldn't generate a response.";
  console.log("replyText", replyText);
  // save & send
  chat.messages.push({ role: "assistant", content: replyText });
  await chat.save();
  await sendMessage(senderId, replyText);
}

async function handleAddFeed(value: any) {
  if (!value.post_id || typeof value.message !== "string") return;
  const result = await PageService.createProduct({
    postId: value.post_id,
    message: value.message,
    createdAt: value.created_time,
  });
  console.log(result ? "Feed Created Successfully" : "Feed Not Created");
}

async function handleEditFeed(value: any) {
  if (!value.post_id || typeof value.message !== "string") return;
  const result = await PageService.updateProduct(value.post_id, {
    message: value.message,
    updatedAt: new Date(),
  });
  console.log(result ? "Feed Updated Successfully" : "Feed Not Updated");
}

async function handleRemoveFeed(value: any) {
  if (!value.post_id) return;
  const result = await PageService.deleteProduct(value.post_id);
  await CommentHistory.deleteMany({ postId: value.post_id });
  console.log(result ? "Feed Deleted Successfully" : "Feed Not Deleted");
}

async function handleAddComment(value: any, method: AIMethod) {
  const { comment_id, message, post_id, from } = value;
  const commenterId = from?.id;
  if (!comment_id || typeof message !== "string" || !commenterId) return;
  if (commenterId === process.env.PAGE_ID) return; // avoid loops

  console.log("💬 New Comment:", message);

  // history per commenter+post
  let hist = await CommentHistory.findOne({
    userId: commenterId,
    postId: post_id,
  });
  if (!hist)
    hist = new CommentHistory({
      userId: commenterId,
      postId: post_id,
      userName: from.name,
      messages: [],
    });
  hist.messages.push({ commentId: comment_id, role: "user", content: message });

  // system prompt
  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  const products = await Product.find();
  const systemPrompt = `You are a helpful assistant for the shop "${shop?.pageName}".`;

  // call AI
  let reply: string;
  switch (method) {
    case "gemini":
      reply = await GeminiService.getCommentReply(
        commenterId,
        comment_id,
        from.name,
        message,
        post_id,
        ActionType.COMMENT
      );
      break;
    case "chatgpt":
      reply = await ChatgptService.getCommentReply(
        commenterId,
        comment_id,
        from.name,
        message,
        post_id,
        ActionType.COMMENT
      );
      break;
    case "deepseek":
      reply = await DeepSeekService.getCommnetResponse(
        commenterId,
        comment_id,
        from.name,
        message,
        post_id,
        ActionType.COMMENT
      );
      break;
    case "grok":
      reply = await GrokService.getCommentReply(
        commenterId,
        comment_id,
        from.name,
        message,
        post_id,
        ActionType.COMMENT
      );
      break;
    default:
      reply = "Sorry, I cannot respond to that comment.";
  }

  // save & reply
  hist.messages.push({
    commentId: comment_id,
    role: "assistant",
    content: reply,
  });
  await hist.save();
  await replyToComment(comment_id, reply);
}

async function handleEditComment(value: any) {
  if (!value.comment_id || typeof value.message !== "string") return;
  const result = await CommentHistory.findOneAndUpdate(
    { "messages.commentId": value.comment_id },
    {
      $set: {
        "messages.$.content": value.message,
        updatedAt: new Date(),
      },
    },
    { new: true }
  );
  console.log(result ? "Comment Updated Successfully" : "Comment Not Updated");
}

async function handleRemoveComment(value: any) {
  if (!value.comment_id) return;
  const result = await CommentHistory.findOneAndUpdate(
    { "messages.commentId": value.comment_id },
    {
      $pull: { messages: { commentId: value.comment_id } },
      $set: { updatedAt: new Date() },
    },
    { new: true }
  );
  console.log(result ? "Comment Deleted Successfully" : "Comment Not Deleted");
}

export const WebHookService = {
  handleIncomingMessages: async (
    req: Request,
    res: Response,
    method: AIMethod
  ): Promise<string> => {
    if (req.body.object !== "page") return "Not a page event";

    let didReply = false; // ◀️ ensure only one DM reply

    for (const entry of req.body.entry) {
      // —— 1) Handle DMs (at most 1 reply) ——
      if (!didReply) {
        const messagingEvents = entry.messaging ?? [];
        for (const event of messagingEvents) {
          const msg = event.message;
          if (!msg || typeof msg.text !== "string") continue;
          if (msg.is_echo) continue; // ignore our own echoes

          // ✅ first real user message—reply and stop
          try {
            await handleDM(event, method);
            didReply = true;
          } catch (err) {
            console.error("❌ handleDM error", err);
          }
          break; // exit messagingEvents loop
        }
      }

      // —— 2) Feed & Comments (unchanged) ——
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const { field, value } = change;
        if (field !== "feed") continue;

        try {
          // Posts
          if (["post", "photo", "video", "status"].includes(value.item)) {
            if (value.verb === "add") await handleAddFeed(value);
            else if (value.verb === "edited") await handleEditFeed(value);
            else if (value.verb === "remove") await handleRemoveFeed(value);
          }
          // Comments
          else if (value.item === "comment") {
            if (value.verb === "add") await handleAddComment(value, method);
            else if (value.verb === "edited") await handleEditComment(value);
            else if (value.verb === "remove") await handleRemoveComment(value);
          }
        } catch (err) {
          console.error("❌ change handler error", err);
        }
      }
    }

    return "Processed";
  },
};
