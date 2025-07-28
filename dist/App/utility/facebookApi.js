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
exports.replyToComment = exports.sendMessage = void 0;
const PAGE_TOKEN = "EAAPC7kQLggkBPH1GjKbF48QiGCSgkXf2v2aVJJ4iIoPI6jvrKMzBWmzUEgl9L5DZBkmFoTai2R780jfh5CZAZBeimTyJRuYf9ZBY9adKJUkApeJLHKNkG8YqF02sThwb7NKrLfsYnHbt60K8E77i08oNmZBwZBUVm1PmmZCY857pUZCTjGcjLsAEyRQclc1CxBZCZCkDPmZADyRExL9uV1mZA5HnRGwBtxkTvYneOVqlmaQeHpZCvrgZDZD";
if (!PAGE_TOKEN)
    throw new Error("Missing FB_PAGE_ACCESS_TOKEN");
const axios_1 = __importDefault(require("axios"));
// const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
if (!PAGE_TOKEN)
    throw new Error("Missing FB_PAGE_ACCESS_TOKEN");
const sendMessage = (recipientId, text) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield axios_1.default.post(`https://graph.facebook.com/v17.0/me/messages`, { recipient: { id: recipientId }, message: { text } }, { params: { access_token: PAGE_TOKEN } });
        console.log(`▶️ Sent Messenger reply to ${recipientId}`);
    }
    catch (err) {
        console.error("❌ Messenger Send Error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
});
exports.sendMessage = sendMessage;
const replyToComment = (commentId, message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield axios_1.default.post(`https://graph.facebook.com/v17.0/${commentId}/comments`, { message }, { params: { access_token: PAGE_TOKEN } });
        console.log(`✔️ Replied to comment ${commentId}`);
    }
    catch (err) {
        console.error("❌ Comment Reply Error:", ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message);
    }
});
exports.replyToComment = replyToComment;
