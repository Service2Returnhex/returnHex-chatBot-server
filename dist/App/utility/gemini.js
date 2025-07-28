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
exports.generateGeminiReply = generateGeminiReply;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
//   project: process.env.GOOGLE_CLOUD_PROJECT,
function generateGeminiReply(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            return response.text || "⚠️ No text received from Gemini";
        }
        catch (err) {
            if (err.code === 429) {
                console.warn("Rate limit hit, backing off…");
                yield new Promise((r) => setTimeout(r, 2000));
            }
            console.error("Gemini API error:", err);
            return "An error occurred while generating the response.";
        }
    });
}
