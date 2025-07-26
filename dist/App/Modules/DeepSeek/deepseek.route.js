"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekRouter = void 0;
const express_1 = __importDefault(require("express"));
const deepseek_controller_1 = require("./deepseek.controller");
const router = express_1.default.Router();
router.get('/response', deepseek_controller_1.DeepSeekController.getResponse);
exports.DeepSeekRouter = router;
