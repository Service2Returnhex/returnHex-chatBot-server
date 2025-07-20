import { Request, Response } from "express";
import { WebhookBody } from "./fb-webhook";
import { processCommentEvent, processMessageEvent } from "./messenger.service";

export const getWebhook = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"] as string;
  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅ Webhook Verified");
    res.status(200).send(challenge);
  } else {
    console.error("❌ Verification failed");
    res.sendStatus(403);
  }
};

export const postWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body as WebhookBody;
  console.log("📥 Webhook Payload:", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const evt of entry.messaging ?? []) {
        await processMessageEvent(evt);
      }
      for (const chg of entry.changes ?? []) {
        await processCommentEvent(chg);
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
};
