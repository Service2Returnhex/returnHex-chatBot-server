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
exports.GeminiService = exports.getCommnetResponse = void 0;
const genai_1 = require("@google/genai");
const shopInfo_model_1 = require("../Page/shopInfo.model");
const product_mode_1 = require("../Page/product.mode");
const chat_history_model_1 = require("../Chatgpt/chat-history.model");
const comment_histroy_model_1 = require("../Chatgpt/comment-histroy.model");
const shop_promt_1 = require("../Page/shop.promt");
const getResponseDM = (senderId, shopId, prompt, action) => __awaiter(void 0, void 0, void 0, function* () {
    let userHistoryDoc = yield chat_history_model_1.ChatHistory.findOne({ senderId });
    if (!userHistoryDoc)
        userHistoryDoc = new chat_history_model_1.ChatHistory({ senderId, messages: [] });
    userHistoryDoc.messages.push({ role: "user", content: prompt });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop)
        throw new Error("Shop not found");
    const products = yield product_mode_1.Product.find({ shopId });
    const getPrompt = (0, shop_promt_1.makePromtDM)(shop, products, prompt);
    const messages = [
        { role: "system", content: getPrompt },
        { role: 'user', content: getPrompt }
    ];
    const geminiMessages = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));
    console.log(geminiMessages);
    const ai = new genai_1.GoogleGenAI({});
    const completion = yield ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: geminiMessages
    });
    const reply = completion.text || "";
    userHistoryDoc.messages.push({ role: "assistant", content: reply });
    yield userHistoryDoc.save();
    return reply;
});
const getCommnetResponse = (commenterId, commentId, userName, message, postId, shopId, action) => __awaiter(void 0, void 0, void 0, function* () {
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
    userCommnetHistoryDoc.messages.push({ commentId, role: "user", content: message });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop)
        throw new Error("Shop not found");
    const products = yield product_mode_1.Product.find({ shopId });
    const specificProduct = yield product_mode_1.Product.findOne({ shopId, postId });
    const getPrompt = (0, shop_promt_1.makePromtComment)(shop, products, specificProduct);
    const messages = [
        { role: "system", content: getPrompt },
        { role: "user", content: message }
    ];
    const geminiMessages = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));
    const ai = new genai_1.GoogleGenAI({});
    const completion = yield ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: geminiMessages
    });
    const reply = `@[${commenterId}] ` + completion.text || "";
    userCommnetHistoryDoc.messages.push({ commentId, role: "assistant", content: reply });
    yield userCommnetHistoryDoc.save();
    return reply;
});
exports.getCommnetResponse = getCommnetResponse;
exports.GeminiService = {
    getResponseDM,
    getCommnetResponse: exports.getCommnetResponse,
};
