import { ChatgptService } from "../Modules/Chatgpt/chatgpt.service";
import { DeepSeekService } from "../Modules/DeepSeek/deepseek.service";
import { GeminiService } from "../Modules/Gemini/gemini.service";
import { GroqService } from "../Modules/Groq/grok.service";

export type AIMethod =   "chatgpt" | "gemini" | "deepseek" | "groq";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}
export async function getAiReplySimple(
  method: AIMethod,
  senderId: string,
  shopId: string,
  userMsg: string,
  actionType: ActionType,
  fallback: AIMethod[] = []
): Promise<string> {
  const call = async (m: AIMethod) => {
    if (m === "chatgpt") return ChatgptService.getResponseDM(senderId, shopId, userMsg, actionType);
    if (m === "gemini") return GeminiService.getResponseDM(senderId, shopId, userMsg, actionType);
    if (m === "deepseek") return DeepSeekService.getResponseDM(senderId, shopId, userMsg, actionType);
    if (m === "groq") return GroqService.getResponseDM(senderId, shopId, userMsg, actionType);
    throw new Error("Unknown AI method: " + m);
  };

  const methodsToTry: AIMethod[] = [method, ...fallback.filter(m => m !== method)];

  for (const m of methodsToTry) {
    try {
      const res = await call(m);
      const text = (res ?? "").toString().trim();
      if (text) return text;
      console.warn(`[AI simple] empty response from ${m}`);
    } catch (err: any) {
      console.warn(`[AI simple] ${m} failed:`, err?.message || err);
    }
  }
  return "";
}
