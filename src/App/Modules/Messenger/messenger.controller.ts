import { Request, Response } from "express";
import { processMessageEvent } from "./messenger.service";

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

export const postWebhook = async (req: Request, res: Response) => {
  const { body } = req;
  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const event of entry.messaging) {
        if (event.message?.text) await processMessageEvent(event);
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else res.sendStatus(404);
};
