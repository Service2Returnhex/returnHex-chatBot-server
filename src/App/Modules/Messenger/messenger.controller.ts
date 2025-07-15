import { Request, Response } from "express";
import { processCommentEvent, processMessageEvent } from "./messenger.service";

export const getWebhook = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"] as string;
  if (mode === "subscribe" && token === process.env.MY_VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    console.error("❌ Forbidden – invalid token or mode");
    res.sendStatus(403);
  }
};

export const postWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = req.body;
  console.log("📥 Webhook Payload:", JSON.stringify(body, null, 2));
  if (body.object === "page") {
    for (const entry of body.entry) {
      (entry.messaging || []).forEach((evt:any) => processMessageEvent(evt));
      (entry.changes || []).forEach((chg:any) => processCommentEvent(chg));
    }
    res.status(200).send("EVENT_RECEIVED");
    return;
  } else {
    res.sendStatus(404);
    return;
  }
};
