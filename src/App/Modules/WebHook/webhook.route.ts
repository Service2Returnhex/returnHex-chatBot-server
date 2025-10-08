import express from "express";
import { WebHookController } from "./webhook.controller";
const router = express.Router();

//verification
router.get("/:pageId/webhook", WebHookController.handleWebhook);

//receive messages
router.post("/:pageId/webhook", WebHookController.handleIncomingMessages);

export const WebhookRouter = router;
