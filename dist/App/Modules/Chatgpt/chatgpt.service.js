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
exports.ChatgptService = exports.getCommnetResponse = void 0;
const openai_1 = __importDefault(require("openai"));
const product_mode_1 = require("../Page/product.mode");
const shop_promt_1 = require("../Page/shop.promt");
const shopInfo_model_1 = require("../Page/shopInfo.model");
const chat_history_model_1 = require("./chat-history.model");
const comment_histroy_model_1 = require("./comment-histroy.model");
const getResponseDM = (senderId, shopId, prompt, action) => __awaiter(void 0, void 0, void 0, function* () {
    let userHistoryDoc = yield chat_history_model_1.ChatHistory.findOne({ userId: senderId });
    if (!userHistoryDoc)
        userHistoryDoc = new chat_history_model_1.ChatHistory({ userId: senderId, messages: [] });
    userHistoryDoc.messages.push({ role: "user", content: prompt });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop)
        throw new Error("Shop not found");
    const products = yield product_mode_1.Product.find({ shopId });
    //save the post info. to the local database
    // create a script for run makePromtDM
    /*
      is it same post - don't call makePromtDM
      is it different post - call the makePromtDM
  
     */
    const getPromt = (0, shop_promt_1.makePromtDM)(shop, products, prompt);
    const messages = [
        { role: "system", content: getPromt },
        { role: "user", content: prompt },
    ];
    const openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const completion = yield openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages,
    });
    //replay should be in 20 token
    //if there is no replay, we will sent a custom response like - [our customer care will contact with you]
    // then the page owener will receive a email with post deatils that ai is not responding
    const reply = completion.choices[0].message.content || "Something Went Wrong";
    userHistoryDoc.messages.push({ role: "assistant", content: reply });
    yield userHistoryDoc.save();
    //nlp: if same related question mathces with db, it will replay from the previous stored response.
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
    userCommnetHistoryDoc.messages.push({
        commentId,
        role: "user",
        content: message,
    });
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId });
    if (!shop)
        throw new Error("Shop not found");
    const products = yield product_mode_1.Product.find({ shopId });
    const specificProduct = yield product_mode_1.Product.findOne({ shopId, postId });
    const getPrompt = (0, shop_promt_1.makePromtComment)(shop, products, specificProduct);
    const messages = [
        { role: "system", content: getPrompt },
        { role: "user", content: message },
    ];
    const openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const completion = yield openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages,
    });
    const reply = `@[${commenterId}] ` + completion.choices[0].message.content;
    userCommnetHistoryDoc.messages.push({
        commentId,
        role: "assistant",
        content: reply,
    });
    yield userCommnetHistoryDoc.save();
    return reply;
});
exports.getCommnetResponse = getCommnetResponse;
exports.ChatgptService = {
    getResponseDM,
    getCommnetResponse: exports.getCommnetResponse,
};
