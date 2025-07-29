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
exports.DeepSeekService = exports.getCommnetResponse = void 0;
const shopInfo_model_1 = require("../Page/shopInfo.model");
const product_mode_1 = require("../Page/product.mode");
const chat_history_model_1 = require("../Chatgpt/chat-history.model");
const comment_histroy_model_1 = require("../Chatgpt/comment-histroy.model");
const shop_promt_1 = require("../Page/shop.promt");
const getResponseDM = (senderId, shopId, prompt, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let userHistoryDoc = yield chat_history_model_1.ChatHistory.findOne({ userId: senderId });
    if (!userHistoryDoc)
        userHistoryDoc = new chat_history_model_1.ChatHistory({ userId: senderId, messages: [] });
    userHistoryDoc.messages.push({ role: "user", content: prompt });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop) {
        throw new Error("Shop not found");
    }
    const products = yield product_mode_1.Product.find({ shopId });
    const getPrompt = (0, shop_promt_1.makePromtDM)(shop, products, prompt);
    const messages = [
        { role: "system", content: getPrompt }, //as much as optimize
        { role: "user", content: prompt },
    ];
    console.log(messages);
    const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            messages,
        }),
    });
    const completion = yield response.json();
    console.log(completion);
    if (completion.error) {
        console.error("OpenRouter API Error:", completion.error);
        return "Sorry, something went wrong on our end. The admin will check this shortly!";
    }
    const reply = ((_c = (_b = (_a = completion.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) ||
        "Sorry, something went wrong. Please try again later.";
    userHistoryDoc.messages.push({ role: "assistant", content: reply });
    yield userHistoryDoc.save();
    return reply;
});
const getCommnetResponse = (commenterId, commentId, userName, message, postId, shopId, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let userCommnetHistoryDoc = yield comment_histroy_model_1.CommentHistory.findOne({
        userId: commenterId,
        postId,
    });
    if (!userCommnetHistoryDoc)
        userCommnetHistoryDoc = new comment_histroy_model_1.CommentHistory({
            userId: commenterId,
            commentId,
            postId,
            userName,
            messages: [],
        });
    userCommnetHistoryDoc.messages.push({
        commentId,
        role: "user",
        content: message,
    });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop) {
        throw new Error("Shop not found");
    }
    const products = yield product_mode_1.Product.find({ shopId });
    const specificProduct = yield product_mode_1.Product.findOne({ shopId, postId });
    const getPromt = (0, shop_promt_1.makePromtComment)(shop, products, specificProduct);
    const messages = [
        { role: "system", content: getPromt },
        { role: "user", content: message },
    ];
    console.log("coming from deepseek");
    const response = yield fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            messages,
        }),
    });
    const completion = yield response.json();
    console.log(completion);
    const reply = `@[${commenterId}] ` + ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content);
    userCommnetHistoryDoc.messages.push({
        commentId,
        role: "assistant",
        content: reply,
    });
    yield userCommnetHistoryDoc.save();
    return reply;
});
exports.getCommnetResponse = getCommnetResponse;
exports.DeepSeekService = {
    getResponseDM,
    getCommnetResponse: exports.getCommnetResponse,
};
