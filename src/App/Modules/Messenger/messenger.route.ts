import { Router } from "express";
import { getWebhook, postWebhook } from "./messenger.controller";

const router = Router();
router.get("/webhook", getWebhook);
router.post("/webhook", postWebhook);
export const MessengerRouter = router;
