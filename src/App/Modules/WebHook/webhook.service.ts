import { Request, Response } from "express";
import { GeminiService } from "../Gemini/gemini.service";
import { ChatgptService } from "../Chatgpt/chatgpt.service";

const verifyWebhook = async (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return challenge;
  } else {
    console.log("Not verified!");
    return "Not Verified";
  }
};

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
          const reply = await GeminiService.getResponse(userMsg);
          await GeminiService.sendMessage(senderId, reply as string);
        } else if (method === "chatgpt") {
          const reply = await ChatgptService.getResponse(userMsg);
          await ChatgptService.sendMessage(senderId, reply as string);
        }
      }

      // Handle comments
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "feed" && change.value.item === "comment") {
          const commentData = change.value;
        //   console.log("💬 Comment Data:", JSON.stringify(commentData, null, 2));

          if (commentData.verb === "add") {
            const commentId = commentData.comment_id;
            const commentMsg = commentData.message;

            //preventing own comment reply
            const commenterId = commentData.from?.id;
            // const pageId = change.value;

            // console.log(commentId + ' ' + commenterId + ' ' + pageId);

            if(commenterId === '708889365641067') {
                console.log("⛔ Skipping own comment to avoid infinite loop.");
                continue;
            }

            if (method === "gemini") {
              const reply = await GeminiService.getResponse(commentMsg);
              await GeminiService.replyToComment(commentId, reply as string);
            } else if (method === "chatgpt") {
              const reply = await ChatgptService.getResponse(commentMsg);
              await ChatgptService.replyToComment(commentId, reply as string);
            }
          }
        }
      }
    }
    return "Reply Bot Working";
  } else {
    return "Reply Not Bot Working";
  }
};

export const WebHookService = {
  verifyWebhook,
  handleIncomingMessages,
};
