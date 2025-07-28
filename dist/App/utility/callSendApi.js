"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicReply = exports.privateReply = exports.callSendAPI = void 0;
const request_1 = __importDefault(require("request"));
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const callSendAPI = (id, message) => {
    (0, request_1.default)({
        uri: `https://graph.facebook.com/v${process.env.GRAPH_API_VERSION}/me/messages`,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: { recipient: { id }, message },
    }, (err) => {
        if (err)
            console.error("Send API error:", err);
    });
};
exports.callSendAPI = callSendAPI;
const privateReply = (commentId, text) => {
    (0, request_1.default)({
        uri: `https://graph.facebook.com/v${process.env.GRAPH_API_VERSION}/${commentId}/private_replies`,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: { message: text },
    }, (err) => err && console.error("Private reply error:", err));
};
exports.privateReply = privateReply;
const publicReply = (commentId, text) => {
    (0, request_1.default)({
        uri: `https://graph.facebook.com/v${process.env.GRAPH_API_VERSION}/${commentId}/replies`,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: { message: text },
    }, (err) => err && console.error("Public reply error:", err));
};
exports.publicReply = publicReply;
