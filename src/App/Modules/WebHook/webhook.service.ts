import { Request, Response } from "express";
import { GeminiService } from "../Gemini/gemini.service";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { PageService } from "../Page/page.service";

// enum ActionType {
//   MSG_REPLY = "reply",
//   COMMENT_REPLAY = "comment",
// }

const handleIncomingMessages = async (
  req: Request,
  res: Response,
  method: "gemini" | "chatgpt",
 
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
          await GeminiService.sendMessage(senderId, reply as string);
        } else if (method === "chatgpt") {
          const reply = await ChatgptService.getResponse(senderId, userMsg);
          await ChatgptService.sendMessage(senderId, reply as string);
        }
      }


      const changes = entry.changes || [];
      for (const change of changes) {
        
        if( change.field === "feed" &&
            change.value.item === "status" &&
            change.value.verb === "add") {
              console.log("New Post Added");
              await PageService.createProduct({
                postId: change.value.post_id,
                message: change.value.message,
              });
            }

        if (change.field === "feed" && change.value.item === "comment") {
          const commentData = change.value;
          const postId = change.value.post_id;
          console.log(postId);
          if (commentData.verb === "add") {
            const commentId = commentData.comment_id;
            const commentMsg = commentData.message;

            //preventing own comment reply
            const commenterId = commentData.from?.id;
            if(commenterId === '708889365641067') {
                console.log("⛔ Skipping own comment to avoid infinite loop.");
                continue;
            }

            if (method === "gemini") {
              const reply = await GeminiService.getResponse(commenterId, commentMsg);
              await GeminiService.replyToComment(commentId, reply as string);
            } else if (method === "chatgpt") {
              console.log("hrer");
              const reply = await ChatgptService.getResponse(commenterId, 
                commentMsg, 
                postId
              );
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
  handleIncomingMessages,
};
