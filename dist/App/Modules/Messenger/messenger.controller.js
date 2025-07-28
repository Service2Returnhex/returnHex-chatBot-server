"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postWebhook = exports.getWebhook = void 0;
const messenger_service_1 = require("./messenger.service");
const getWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.MY_VERIFY_TOKEN) {
        console.log("✅ Webhook Verified");
        res.status(200).send(challenge);
    }
    else {
        console.error("❌ Verification failed");
        res.sendStatus(403);
    }
};
exports.getWebhook = getWebhook;
const postWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const body = req.body;
    console.log("📥 Webhook Payload:", JSON.stringify(body, null, 2));
    if (body.object === "page") {
        for (const entry of body.entry) {
            for (const evt of (_a = entry.messaging) !== null && _a !== void 0 ? _a : []) {
                yield (0, messenger_service_1.processMessageEvent)(evt);
            }
            for (const chg of (_b = entry.changes) !== null && _b !== void 0 ? _b : []) {
                yield (0, messenger_service_1.processCommentEvent)(chg);
            }
        }
        res.status(200).send("EVENT_RECEIVED");
    }
    else {
        res.sendStatus(404);
    }
});
exports.postWebhook = postWebhook;
