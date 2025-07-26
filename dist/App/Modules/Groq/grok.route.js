"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqRouter = void 0;
const express_1 = __importDefault(require("express"));
const grok_controller_1 = require("./grok.controller");
const router = express_1.default.Router();
router.get('/response', grok_controller_1.GroqController.getResponse);
exports.GroqRouter = router;
