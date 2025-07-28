import { sendMessage } from "../../../api/facebook.api";
import { ChatgptService } from "../../Chatgpt/chatgpt.service";
import { DeepSeekService } from "../../DeepSeek/deepseek.service";
import { GeminiService } from "../../Gemini/gemini.service";
import { GroqService } from "../../Groq/grok.service";

export type AIMethod = "gemini" | "chatgpt" | "deepseek" | "groq";

export class DMService {
  static async handleDM(event: any, method: AIMethod, pageAccessToken: string) {
    const senderId = event.sender.id;
    const userMsg = event.message.text;
    console.log("💬 DM Message:", userMsg);

    let reply: string;
    switch (method) {
      case "gemini":
        reply = await GeminiService.getResponseDM(senderId, userMsg, "reply");
        break;
      case "chatgpt":
        reply = await ChatgptService.getResponseDM(senderId, userMsg, "reply");
        break;
      case "deepseek":
        reply = await DeepSeekService.getResponseDM(senderId, userMsg, "reply");
        break;
      case "groq":
        reply = await GroqService.getResponseDM(senderId, userMsg, "reply");
        break;
      default:
        reply = "";
    }

    await sendMessage(senderId, reply, pageAccessToken);
  }
}
