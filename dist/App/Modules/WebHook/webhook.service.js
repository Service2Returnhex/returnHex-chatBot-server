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
const handleDM = (event, pageId, method) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = event.sender.id;
    const userMsg = event.message.text;
    console.log("💬 DM Message:", userMsg);
    let reply = "";
    try {
        if (method === "gemini") {
            reply = yield gemini_service_1.GeminiService.getResponseDM(senderId, pageId, userMsg, ActionType.DM);
        }
        else if (method === "chatgpt") {
            reply = yield chatgpt_service_1.ChatgptService.getResponseDM(senderId, pageId, userMsg, ActionType.DM);
        }
        else if (method === "deepseek") {
            reply = yield deepseek_service_1.DeepSeekService.getResponseDM(senderId, pageId, userMsg, ActionType.DM);
        }
        else if (method === "groq") {
            reply = yield grok_service_1.GroqService.getResponseDM(senderId, pageId, userMsg, ActionType.DM);
        }
    }
    catch (error) {
        console.log("Error generating reply:", error === null || error === void 0 ? void 0 : error.message);
    }
    try {
        yield (0, facebook_api_1.sendMessage)(senderId, pageId, reply);
    }
    catch (error) {
        console.log("Error sending reply:", error === null || error === void 0 ? void 0 : error.message);
    }
});
const handleAddFeed = (value, pageId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield page_service_1.PageService.createProduct({
            postId: value.post_id,
            message: value.message,
            shopId: pageId,
            createdAt: value.created_time,
            full_picture: value.full_picture
        });
        !result
            ? console.log("Feed Not Created")
            : console.log("Feed Created Successfully");
    }
    catch (error) {
        console.log("Feed Not Created, Error: ", error === null || error === void 0 ? void 0 : error.message);
    }
});
const handleEditFeed = (value, pageId) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id, message } = value;
    try {
        const result = yield page_service_1.PageService.updateProduct(pageId, post_id, {
            message,
            updatedAt: new Date(),
        });
        !result
            ? console.log("Feed Not Updated")
            : console.log("Feed Updated Successfully");
    }
    catch (error) {
        console.log("Feed Not Updated, Error: ", error === null || error === void 0 ? void 0 : error.message);
    }
});
const handleRemoveFeed = (value, pageId) => __awaiter(void 0, void 0, void 0, function* () {
    const { post_id } = value;
    try {
        const result = yield page_service_1.PageService.deleteProduct(pageId, post_id);
        const result1 = yield comment_histroy_model_1.CommentHistory.findOneAndDelete({ postId: post_id });
        !result
            ? console.log("Feed Not Deleted")
            : console.log("Feed Deleted Successfully");
        !result1
            ? console.log("Comment History Not Deleted")
            : console.log("Comment History Deleted Successfully");
    }
    catch (error) {
        console.log("Feed Not Deleted\nComment History Not Deleted\nError: ", error.message);
    }
});
const handleAddComment = (value, pageId, method) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id, message, post_id, from } = value;
    const commenterId = from === null || from === void 0 ? void 0 : from.id;
    const userName = from === null || from === void 0 ? void 0 : from.name;
    console.log(commenterId, pageId);
    if (commenterId === pageId) {
        console.log("⛔ Skipping own comment to avoid infinite loop.");
        return;
    }
    console.log("💬 New Comment:", message);
    let reply = "";
    try {
        if (method === "gemini") {
            reply = yield gemini_service_1.GeminiService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, pageId, ActionType.COMMENT);
        }
        else if (method === "chatgpt") {
            reply = yield chatgpt_service_1.ChatgptService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, pageId, ActionType.COMMENT);
        }
        else if (method === "deepseek") {
            reply = yield deepseek_service_1.DeepSeekService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, pageId, ActionType.COMMENT);
        }
        else {
            reply = yield grok_service_1.GroqService.getCommnetResponse(commenterId, comment_id, userName || "Customer", message, post_id, pageId, ActionType.COMMENT);
        }
    }
    catch (err) {
        console.log("Error generating Comment Replay:", err.message);
    }
    try {
        yield (0, facebook_api_1.replyToComment)(comment_id, pageId, reply);
    }
    catch (error) {
        console.log("Error Sending Comment Replay: ", error === null || error === void 0 ? void 0 : error.message);
    }
});
const handleEditComment = (value, pageId) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id, message } = value;
    try {
        const result = yield comment_histroy_model_1.CommentHistory.findOneAndUpdate({ "messages.commentId": comment_id }, {
            $set: {
                "messages.$.content": message,
                updatedAt: new Date(),
            },
        }, { new: true });
        !result
            ? console.log("Comment Not Updated")
            : console.log("Comment Updated Successfully");
    }
    catch (error) {
        console.log("Comment Not Updated, Error: ", error === null || error === void 0 ? void 0 : error.message);
    }
});
const handleRemoveComment = (value, pageId) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment_id } = value;
    try {
        const result = yield comment_histroy_model_1.CommentHistory.findOneAndUpdate({ "messages.commentId": comment_id }, {
            $pull: { messages: { commentId: comment_id } },
            $set: { updatedAt: new Date() },
        }, { new: true });
        !result
            ? console.log("Comment Not Deleted")
            : console.log("Comment Deleted Successfully");
    }
    catch (error) {
        console.log("Comment Not Deleted, Error: ", error === null || error === void 0 ? void 0 : error.message);
    }
});
const handleIncomingMessages = (req, res, pageId, method) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.body.object !== "page") {
        return "Reply Not Bot Working";
    }
    for (const entry of req.body.entry) {
        const event = (_a = entry.messaging) === null || _a === void 0 ? void 0 : _a[0];
        if (event === null || event === void 0 ? void 0 : event.message) {
            handleDM(event, pageId, method);
            continue;
        }
        const changes = entry.changes || [];
        for (const change of changes) {
            const { field, value } = change;
            // console.log("Feed Change:", JSON.stringify(change, null, 2));
            if (field === "feed" &&
                ["post", "photo", "video", "status"].includes(value.item)) {
                if (value.verb === "add") {
                    handleAddFeed(value, pageId);
                }
                else if (value.verb === "edited") {
                    handleEditFeed(value, pageId);
                }
                else if (value.verb === "remove") {
                    handleRemoveFeed(value, pageId);
                }
            }
            if (field === "feed" && value.item === "comment") {
                if (value.verb === "add") {
                    handleAddComment(value, pageId, method);
                }
                else if (value.verb === "edited") {
                    handleEditComment(value, pageId);
                }
                else if (value.verb === "remove") {
                    handleRemoveComment(value, pageId);
                }
            }
        }
    }
    return "Reply Bot Working";
});
exports.WebHookService = {
    handleIncomingMessages,
};
