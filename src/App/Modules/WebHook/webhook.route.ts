import express from "express";
import { WebHookController } from "./webhook.controller";
const router = express.Router();

// //verification
// router.get('/', WebHookController.handleWebhook);

// //receive messages
// router.post('/', WebHookController.handleIncomingMessages);
// Dynamic URL: /api/v1/webhook/:pageId/webhook
router.get("/:pageId/webhook", WebHookController.handleWebhook);
router.post("/:pageId/webhook", WebHookController.handleIncomingMessages);

export const WebhookRouter = router;
