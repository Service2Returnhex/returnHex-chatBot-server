"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRouter = void 0;
const express_1 = __importDefault(require("express"));
const webhook_controller_1 = require("./webhook.controller");
const router = express_1.default.Router();
//verification
router.get('/:pageId/webhook', webhook_controller_1.WebHookController.handleWebhook);
//receive messages
router.post('/:pageId/webhook', webhook_controller_1.WebHookController.handleIncomingMessages);
exports.WebhookRouter = router;
