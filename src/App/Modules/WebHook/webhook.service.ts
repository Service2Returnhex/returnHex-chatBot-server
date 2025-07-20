import { Request, Response } from "express";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { GeminiService } from "../Gemini/gemini.service";
import { PageService } from "../Page/page.service";

// enum ActionType {
//   MSG_REPLY = "reply",
//   COMMENT_REPLAY = "comment",
// }
interface WebhookEntry {
  changes?: Array<{
    field: string;
    value: {
      item: "status" | "comment";
      verb: string;
      post_id?: string;
      comment_id?: string;
      message?: string;
      from?: { id: string };
    };
  }>;
}

const handleIncomingMessages = async (
  req: Request,
  res: Response,
  method: "gemini" | "chatgpt"
) => {
  if (req.body.object === "page") {
    for (const entry of req.body.entry) {
      const event = entry.messaging?.[0];
      if (event?.message) {
        const senderId = event.sender.id;
        const userMsg = event.message.text;
        console.log("💬 DM Message:", userMsg);

        if (method === "gemini") {
          const reply = await GeminiService.getResponse(senderId, userMsg);
          console.log("💬 DM reply:", reply);
          await GeminiService.sendMessage(senderId, reply as string);
        } else if (method === "chatgpt") {
          const reply = await ChatgptService.getResponse(senderId, userMsg);
          await ChatgptService.sendMessage(senderId, reply as string);
        }
      }

      // const entries = req.body.entry as WebhookEntry[];
      // for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        const { field, value } = change;

        // 📝 New post added
        if (
          field === "feed" &&
          value.item === "status" &&
          value.verb === "add"
          // value.post_id &&
          // value.message
        ) {
          console.log("🆕 New Post detected:", value.post_id, value.message);

          await PageService.createProduct({
            postId: change.value.post_id,
            message: change.value.message,
          });
        }

        // 💬 New comment added
        if (
          field === "feed" &&
          value.item === "comment" &&
          value.verb === "add" &&
          value.comment_id &&
          value.post_id &&
          value.message &&
          value.from?.id
        ) {
          // console.log("💬 New Comment detected on post:", value.post_id);
          // console.log("    comment_id:", value.comment_id);
          // console.log("    text:", value.message);

          const commenterId = value.from.id;
          // Placing your own page ID in .env to avoid replies to self
          if (commenterId === process.env.PAGE_ID) {
            console.log("⛔ Skipping reply to own Page comment.");
            continue;
          }

          let replyText: string;
          if (method === "gemini") {
            const resp = await GeminiService.getResponse(
              commenterId,
              value.message,
              value.post_id
            );
            replyText =
              resp ?? "Sorry, I couldn't generate a response right now.";
          } else {
            const resp = await ChatgptService.getResponse(
              commenterId,
              value.message,
              value.post_id
            );
            replyText =
              resp ?? "Sorry, I couldn't generate a response right now.";
          }

          console.log(
            "📤 Attempting to reply to comment",
            value.comment_id,
            "with:",
            replyText
          );
          // await ChatgptService.replyToComment(value.comment_id, replyText);
          await GeminiService.replyToComment(value.comment_id, replyText);
        }
        // }
      }
    }
    return "Reply Bot Working";
  } else {
    return "Reply Not Bot Working";
  }
};

export const WebHookService = {
  handleIncomingMessages,
};
