import express from "express";
import { webhookLimiter } from "../../Middlewares/RateLimiter";
import { WebHookController } from "./webhook.controller";
const router = express.Router();

//verification
router.get("/:pageId/webhook", WebHookController.handleWebhook);

//receive messages
router.post(
  "/:pageId/webhook",
  webhookLimiter,
  WebHookController.handleIncomingMessages
);

export const WebhookRouter = router;
