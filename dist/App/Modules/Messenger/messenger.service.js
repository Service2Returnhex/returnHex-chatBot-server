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
exports.processMessageEvent = processMessageEvent;
exports.processCommentEvent = processCommentEvent;
const facebookApi_1 = require("../../utility/facebookApi");
function processMessageEvent(event) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        if ((_a = event.message) === null || _a === void 0 ? void 0 : _a.is_echo)
            return;
        const senderId = (_b = event.sender) === null || _b === void 0 ? void 0 : _b.id;
        const text = (_c = event.message) === null || _c === void 0 ? void 0 : _c.text;
        if (senderId && text) {
            yield (0, facebookApi_1.sendMessage)(senderId, `You said: ${text}`);
        }
    });
}
function processCommentEvent(change) {
    return __awaiter(this, void 0, void 0, function* () {
        const val = change.value;
        if (change.field === "feed" &&
            val.item === "comment" &&
            val.verb === "add" &&
            val.comment_id &&
            val.message) {
            yield (0, facebookApi_1.replyToComment)(val.comment_id, `Thanks for commenting: "${val.message}"`);
        }
    });
}
