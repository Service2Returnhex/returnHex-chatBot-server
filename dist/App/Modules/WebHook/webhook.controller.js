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
exports.WebHookController = exports.handleIncomingMessages = exports.handleWebhook = void 0;
const http_status_1 = __importDefault(require("http-status"));
const cathcAsync_1 = require("../../utility/cathcAsync");
const sendResponse_1 = __importDefault(require("../../utility/sendResponse"));
const page_service_1 = require("../Page/page.service");
const webhook_service_1 = require("./webhook.service");
exports.handleWebhook = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageId } = req.params;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    console.log(pageId);
    const shop = yield page_service_1.PageService.getShopById(pageId);
    if (mode && token && mode === "subscribe" && token === shop.verifyToken) {
        console.log("Webhook verified!");
        res.status(200).send(challenge);
    }
    else {
        console.log("Webhook Not Verified");
        res.sendStatus(403);
    }
}));
var WebHookMethods;
(function (WebHookMethods) {
    WebHookMethods["GEMINI"] = "gemini";
    WebHookMethods["CHATGPT"] = "chatgpt";
    WebHookMethods["DEEPSEEK"] = "deepseek";
    WebHookMethods["GROQ"] = "groq";
})(WebHookMethods || (WebHookMethods = {}));
exports.handleIncomingMessages = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageId } = req.params;
    // const userIP = [
    //   { ip: "192.168.10.2", count: 20 }, //rate limiting
    // ];
    /*
    0. Check IP first and collect the IP
      0.1 Same IP cannot make request more than 20 times
      0.2 If same if hit 21 times send custom replay. [Custom Replay - We'll contact with you]
    1.check comment or message
       1.1 Check message not more than 20 token
       1.2 If message include price then price details sending
       1.3  If message include location then location details sending
    2. Check comment or message not more than 20 token
       2.1 If comment is more than 20 token, sent coustom replay. [Please call us for more information]
    4. Else rest of the work!
      4.1 If client toke is 20 - replay will  not be more than 50 token
      4.2 If '' '' '' 10 token - "" "" "" 20 token
    5. Rest of the wortk
    */
    const result = yield webhook_service_1.WebHookService.handleIncomingMessages(req, res, pageId, WebHookMethods.CHATGPT);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Incoming messages handled successfully",
        data: result,
    });
}));
exports.WebHookController = {
    handleWebhook: exports.handleWebhook,
    handleIncomingMessages: exports.handleIncomingMessages,
};
