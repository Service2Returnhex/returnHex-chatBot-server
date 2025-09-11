import express from "express";
import {
  handleWhatsAppIncoming,
  verifyWhatsAppWebhook,
} from "./whatsapp.controller";
const router = express.Router();

router.get("/webhook/:shopId", verifyWhatsAppWebhook);
router.post("/webhook/:shopId", handleWhatsAppIncoming);

export const WhatsAppWebhookRouter = router;
