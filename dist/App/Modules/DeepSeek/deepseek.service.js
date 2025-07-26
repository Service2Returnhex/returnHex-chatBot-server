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
exports.DeepSeekService = exports.getCommnetResponse = void 0;
//not completed(credit issues)
const openai_1 = __importDefault(require("openai"));
const shopInfo_model_1 = require("../Page/shopInfo.model");
const product_mode_1 = require("../Page/product.mode");
const chat_history_model_1 = require("../Chatgpt/chat-history.model");
const comment_histroy_model_1 = require("../Chatgpt/comment-histroy.model");
const shop_promt_1 = require("../Page/shop.promt");
const getResponseDM = (userId, prompt, action) => __awaiter(void 0, void 0, void 0, function* () {
    let userHistoryDoc = yield chat_history_model_1.ChatHistory.findOne({ userId });
    if (!userHistoryDoc)
        userHistoryDoc = new chat_history_model_1.ChatHistory({ userId, messages: [] });
    userHistoryDoc.messages.push({ role: "user", content: prompt });
    const shop = yield shopInfo_model_1.ShopInfo.findById(process.env.SHOP_ID);
    if (!shop) {
        throw new Error("Shop not found");
    }
    const products = yield product_mode_1.Product.find();
    const getPrompt = (0, shop_promt_1.makePromtDM)(shop, products);
    const messages = [
        { role: "system", content: getPrompt },
        ...userHistoryDoc.messages,
    ];
    console.log(process.env.OPEN_ROUTER_API_KEY);
    // const openai = new OpenAI({
    //   baseURL: 'https://openrouter.ai/api/v1',
    //   apiKey: process.env.OPEN_ROUTER_API_KEY,
    // });
    // const completion = await openai.chat.completions.create({
    //   model: "deepseek/deepseek-chat:free",
    //   messages,
    // });
    const response = yield fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-chat:free',
            messages,
        }),
    });
    const completion = yield response.json();
    // const reply = completion.choices[0].message.content || "";
    // userHistoryDoc.messages.push({ role: "assistant", content: reply });
    // await userHistoryDoc.save();
    return completion;
});
const getCommnetResponse = (commenterId, commentId, userName, message, postId, action) => __awaiter(void 0, void 0, void 0, function* () {
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
    const shop = yield shopInfo_model_1.ShopInfo.findById(process.env.SHOP_ID);
    if (!shop) {
        throw new Error("Shop not found");
    }
    const products = yield product_mode_1.Product.find();
    const specificProduct = yield product_mode_1.Product.findOne({ postId });
    const getPromt = (0, shop_promt_1.makePromtComment)(shop, products, specificProduct);
    const messages = [
        { role: "system", content: getPromt },
        ...userCommnetHistoryDoc.messages,
    ];
    const openai = new openai_1.default({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
    });
    const completion = yield openai.chat.completions.create({
        model: "deepseek-chat",
        messages,
    });
    const reply = `@[${commenterId}] ` + completion.choices[0].message.content;
    userCommnetHistoryDoc.messages.push({ commentId, role: "assistant", content: reply });
    yield userCommnetHistoryDoc.save();
    return reply;
});
exports.getCommnetResponse = getCommnetResponse;
exports.DeepSeekService = {
    getResponseDM,
    getCommnetResponse: exports.getCommnetResponse,
};
