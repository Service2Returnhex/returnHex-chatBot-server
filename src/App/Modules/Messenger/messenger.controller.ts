import { Request, Response } from "express";
import { replyToComment, sendTextMessage } from "../../utility/facebookApi";

interface MessengerEvent {
  sender?: { id: string };
  message?: { text: string };
}

interface FeedChange {
  field: string;
  value: {
    item: string;
    verb: string;
    comment_id?: string;
  };
}
interface PageEntry {
  messaging?: MessengerEvent[];
  changes?: FeedChange[];
}

interface WebhookBody {
  object: string;
  entry: PageEntry[];
}

export const getWebhook = (req: Request, res: Response) => {
  //   console.log("/messenger/webhook GET query:", req.query);
  //   console.log("VERIFY_TOKEN from env:", process.env.MY_VERIFY_TOKEN);
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.MY_VERIFY_TOKEN) {
    res.status(200).send(challenge as string);
    return;
  } else console.log("❌ Forbidden - invalid token or mode");

  res.sendStatus(403);
};

export async function postWebhook(req: Request, res: Response): Promise<void> {
  const body = req.body as WebhookBody;

  if (body.object === "page") {
    for (const entry of body.entry) {
      // 📩 Handle incoming Messenger messages
      const messagingEvents = entry.messaging ?? [];
      for (const event of messagingEvents) {
        if (event.sender?.id && event.message?.text) {
          sendTextMessage(event.sender.id, `Echo: ${event.message.text}`);
        }
      }

      // 💬 Handle new public comments on page posts
      const feedChanges = entry.changes ?? [];
      for (const change of feedChanges) {
        if (
          change.field === "feed" &&
          change.value.item === "comment" &&
          change.value.verb === "add" &&
          change.value.comment_id
        ) {
          replyToComment(change.value.comment_id, "Thanks for commenting! 😊");
        }
      }
    }

 res.sendStatus(200);
 return
  }

   res.sendStatus(404);
   return
}
