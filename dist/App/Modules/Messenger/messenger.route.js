"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessengerRouter = void 0;
const express_1 = require("express");
const messenger_controller_1 = require("./messenger.controller");
const router = (0, express_1.Router)();
router.get("/webhook", messenger_controller_1.getWebhook);
router.post("/webhook", messenger_controller_1.postWebhook);
exports.MessengerRouter = router;
