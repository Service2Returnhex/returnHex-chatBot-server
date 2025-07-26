"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatgptRouter = void 0;
const express_1 = __importDefault(require("express"));
const chatgpt_controller_1 = require("./chatgpt.controller");
const router = express_1.default.Router();
router.get('/response', chatgpt_controller_1.ChatgptController.getResponse);
exports.ChatgptRouter = router;
