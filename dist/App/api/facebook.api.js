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
const axios_1 = __importDefault(require("axios"));
const shopInfo_model_1 = require("../Modules/Page/shopInfo.model");
const AppError_1 = __importDefault(require("../utility/AppError"));
const sendMessage = (recipientId, pageId, text) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId: pageId });
    if (!shop)
        throw new AppError_1.default(404, 'Shop Not Found!');
    const res = yield axios_1.default.post(`https://graph.facebook.com/v23.0/me/messages?access_token=${shop.accessToken}`, {
        recipient: { id: recipientId },
        message: { text },
    });
    console.log(res.data);
});
exports.sendMessage = sendMessage;
const replyToComment = (commentId, pageId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const shop = yield shopInfo_model_1.ShopInfo.findOne({ shopId: pageId });
    if (!shop)
        throw new AppError_1.default(404, 'Shop Not Found!');
    const response = yield axios_1.default.post(`https://graph.facebook.com/v23.0/${commentId}/comments`, {
        message,
    }, {
        params: {
            access_token: shop.accessToken,
        },
    });
    console.log("✅ Comment reply sent:", response.data);
});
exports.replyToComment = replyToComment;
