import { Request, Response } from "express";
import { processCommentEvent, processMessage } from "./messenger.service";

export const getWebhook = (req: Request, res: Response) => {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;
  if (mode === "subscribe" && token === process.env.MY_VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge as string);
    return;
  }
  res.sendStatus(403);
  return;
};

export const postWebhook = (req: Request, res: Response) => {
  const body = req.body;
  if (body.object === "page") {
    body.entry.forEach((entry: any) => {
      if (entry.messaging) {
        entry.messaging.forEach((event: any) => {
          if (event.message || event.postback) {
            processMessage(event);
          }
        });
      }
      if (entry.changes) {
        entry.changes.forEach((change: any) => {
          if (change.field === "feed" && change.value.item === "comment") {
            processCommentEvent(change.value);
          }
        });
      }
    });
    res.status(200).send("EVENT_RECEIVED");
    return;
  }
  res.sendStatus(404);
  return;
};
