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
exports.WebHookService = void 0;
const gemini_service_1 = require("../Gemini/gemini.service");
const chatgpt_service_1 = require("../Chatgpt/chatgpt.service");
const page_service_1 = require("../Page/page.service");
const comment_histroy_model_1 = require("../Chatgpt/comment-histroy.model");
const facebook_api_1 = require("../../api/facebook.api");
const deepseek_service_1 = require("../DeepSeek/deepseek.service");
const grok_service_1 = require("../Groq/grok.service");
var ActionType;
(function (ActionType) {
    ActionType["DM"] = "reply";
    ActionType["COMMENT"] = "comment";
})(ActionType || (ActionType = {}));
const handleDM = (event, method) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = event.sender.id;
    const userMsg = event.message.text;
    console.log("💬 DM Message:", userMsg);
    const reply = method === "gemini"
        ? yield gemini_service_1.GeminiService.getResponseDM(senderId, userMsg, ActionType.DM)
        : method === "chatgpt"
            ? yield chatgpt_service_1.ChatgptService.getResponseDM(senderId, userMsg, ActionType.DM)
            : method === 'deepseek'
                ? yield deepseek_service_1.DeepSeekService.getResponseDM(senderId, userMsg, ActionType.DM)
                : yield grok_service_1.GroqService.getResponseDM(senderId, userMsg, ActionType.DM);
    //paid
    yield (0, facebook_api_1.sendMessage)(senderId, reply);
});
const handleAddFeed = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield page_service_1.PageService.createProduct({
        postId: value.post_id,
        message: value.message,
        createdAt: value.created_time,
    });
    !result
        ? console.log("Feed Not Created")
        : console.log("Feed Created Successfully");
});
const handleEditFeed = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id, message } = value;
    const result = yield page_service_1.PageService.updateProduct(post_id, {
        message,
        updatedAt: new Date(),
    });
    !result
        ? console.log("Feed Not Updated")
        : console.log("Feed Updated Successfully");
});
const handleRemoveFeed = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = value;
    const result = yield page_service_1.PageService.deleteProduct(post_id);
    yield comment_histroy_model_1.CommentHistory.findOneAndDelete({ postId: post_id });
    !result
        ? console.log("Feed Not Deleted")
        : console.log("Feed Deleted Successfully");
});
const handleAddComment = (value, method) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id, message, post_id, from } = value;
    const commenterId = from === null || from === void 0 ? void 0 : from.id;
    const userName = from === null || from === void 0 ? void 0 : from.name;
    if (commenterId === "708889365641067") {
        console.log("⛔ Skipping own comment to avoid infinite loop.");
        return;
    }
    console.log("💬 New Comment:", message);
    const reply = method === "gemini"
        ? yield gemini_service_1.GeminiService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, ActionType.COMMENT)
        : method === "chatgpt"
            ? yield chatgpt_service_1.ChatgptService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, ActionType.COMMENT)
            : method === 'deepseek'
                ? yield deepseek_service_1.DeepSeekService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, ActionType.COMMENT)
                : yield grok_service_1.GroqService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, ActionType.COMMENT);
    yield (0, facebook_api_1.replyToComment)(comment_id, reply);
});
const handleEditComment = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id, message } = value;
    console.log(comment_id);
    const result = yield comment_histroy_model_1.CommentHistory.findOneAndUpdate({ "messages.commentId": comment_id }, {
        $set: {
            "messages.$.content": message,
            updatedAt: new Date(),
        },
    }, { new: true });
    !result
        ? console.log("Comment Not Updated")
        : console.log("Comment Updated Successfully");
});
const handleRemoveComment = (value) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id } = value;
    const result = yield comment_histroy_model_1.CommentHistory.findOneAndUpdate({ "messages.commentId": comment_id }, {
        $pull: { messages: { commentId: comment_id } },
        $set: { updatedAt: new Date() },
    }, { new: true });
    !result
        ? console.log("Comment Not Deleted")
        : console.log("Comment Deleted Successfully");
});
const handleIncomingMessages = (req, res, method) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.body.object !== "page") {
        return "Reply Not Bot Working";
    }
    for (const entry of req.body.entry) {
        const event = (_a = entry.messaging) === null || _a === void 0 ? void 0 : _a[0];
        if (event === null || event === void 0 ? void 0 : event.message) {
            handleDM(event, method);
            continue;
        }
        const changes = entry.changes || [];
        for (const change of changes) {
            const { field, value } = change;
            // console.log("Feed Change:", JSON.stringify(change, null, 2));
            if (field === "feed" &&
                ["post", "photo", "video", "status"].includes(value.item)) {
                if (value.verb === "add") {
                    handleAddFeed(value);
                }
                else if (value.verb === "edited") {
                    handleEditFeed(value);
                }
                else if (value.verb === "remove") {
                    handleRemoveFeed(value);
                }
            }
            if (field === "feed" && value.item === "comment") {
                if (value.verb === "add") {
                    handleAddComment(value, method);
                }
                else if (value.verb === "edited") {
                    handleEditComment(value);
                }
                else if (value.verb === "remove") {
                    handleRemoveComment(value);
                }
            }
        }
    }
    return "Reply Bot Working";
});
exports.WebHookService = {
    handleIncomingMessages,
};
