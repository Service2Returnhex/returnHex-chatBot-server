import { botConfig } from "../config/botConfig";
import { IChatMessages } from "../Modules/Chatgpt/chat-history.model";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const messageSummarizer = async (
  oldMessages: IChatMessages[],
  oldSummary: string,
  maxToken: number = botConfig.messageSummarizerMaxToken
) => {
  const text = oldMessages
    .map((m: IChatMessages) => `${m.role.toUpperCase()} : ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: botConfig.messageSummarizerModel,
    messages: [
      {
        role: "system",
        content: `You are a summarization assistant. 
    Your task is to create a structured summary of the conversation. 
    - Do not omit or lose any important information. 
    - Preserve all facts, questions, answers, and decisions. 
    - Maintain chronological order. 
    - Use concise sentences but keep all details. 
    - If the summary exceeds ${maxToken} tokens, compress wording but never remove information.`,
      },
      {
        role: "user",
        content: `Chat text: ${text}\n\nPrevious summary (for context): ${oldSummary}`,
      },
    ],
    max_tokens: maxToken,
  });

  return response.choices[0].message.content?.trim();
};

export const AIResponse = async (
  promt: string,
  systemPromt: string,
  maxToken: number
) => {
  const response = await openai.chat.completions.create({
    model: botConfig.NormaAIResponseModel,
    messages: [
      { role: "system", content: systemPromt },
      { role: "user", content: promt },
    ],
    max_tokens: maxToken,
  });

  return response.choices[0].message.content?.trim();
};
