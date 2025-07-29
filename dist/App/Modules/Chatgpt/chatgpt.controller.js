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
exports.ChatgptController = void 0;
const cathcAsync_1 = require("../../utility/cathcAsync");
const sendResponse_1 = __importDefault(require("../../utility/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const chatgpt_service_1 = require("./chatgpt.service");
const getResponse = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chatgpt_service_1.ChatgptService.getResponseDM('dummy-user', "dummy-shopid", req.body.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "ChatGPT response retrieved successfully",
        data: result,
    });
}));
exports.ChatgptController = {
    getResponse
};
