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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = exports.getCommnetResponse = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const shopInfo_model_1 = require("../Page/shopInfo.model");
const product_mode_1 = require("../Page/product.mode");
const chat_history_model_1 = require("../Chatgpt/chat-history.model");
const comment_histroy_model_1 = require("../Chatgpt/comment-histroy.model");
const shop_promt_1 = require("../Page/shop.promt");
const getResponseDM = (senderId, shopId, prompt, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let userHistoryDoc = yield chat_history_model_1.ChatHistory.findOne({ userId: senderId });
    if (!userHistoryDoc)
        userHistoryDoc = new chat_history_model_1.ChatHistory({ userId: senderId, messages: [] });
    userHistoryDoc.messages.push({ role: "user", content: prompt });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop)
        throw new Error("Shop not found");
    const products = yield product_mode_1.Product.find({ shopId });
    const getPrompt = (0, shop_promt_1.makePromtDM)(shop, products, prompt);
    const cleanedMessages = [
        { role: "system", content: getPrompt },
        { role: 'user', content: prompt }
    ];
    console.log(process.env.GROQ_API_KEY);
    const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
    const completion = yield groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: cleanedMessages
    });
    const reply = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
    userHistoryDoc.messages.push({ role: "assistant", content: reply });
    yield userHistoryDoc.save();
    console.log("coming form groq");
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
    userCommnetHistoryDoc.messages.push({ commentId, role: "user", content: message });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop)
        throw new Error("Shop not found");
    const products = yield product_mode_1.Product.find({ shopId });
    const specificProduct = yield product_mode_1.Product.findOne({ shopId, postId });
    const getPrompt = (0, shop_promt_1.makePromtComment)(shop, products, specificProduct);
    const cleanedMessages = [
        { role: "system", content: getPrompt },
        { role: 'user', content: message }
    ];
    console.log("coming from groq");
    const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
    const completion = yield groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: cleanedMessages
    });
    const reply = `@[${commenterId}] ` + ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
    userCommnetHistoryDoc.messages.push({ commentId, role: "assistant", content: reply });
    yield userCommnetHistoryDoc.save();
    return reply;
});
exports.getCommnetResponse = getCommnetResponse;
exports.GroqService = {
    getResponseDM,
    getCommnetResponse: exports.getCommnetResponse,
};
