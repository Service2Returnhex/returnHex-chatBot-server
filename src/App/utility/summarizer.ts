import { botConfig } from "../config/botConfig";
import { IChatMessages } from "../Modules/Chatgpt/chat-history.model";
import OpenAI from "openai";

export type TtokenUsage = {
  inputToken: number;
  outputToken: number;
  totalToken: number;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export let messageSummarizerTokenUsages: TtokenUsage = {
  inputToken: 0,
  outputToken: 0,
  totalToken: 0,
};

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
        content: `Summarize the following chat in ${maxToken} token:`,
      },
      { role: "user", content: text + `old Summary: ${oldSummary}` },
    ],
    max_tokens: maxToken,
  });
  messageSummarizerTokenUsages.inputToken = response.usage?.prompt_tokens  || 0
  messageSummarizerTokenUsages.outputToken = response.usage?.completion_tokens|| 0
  messageSummarizerTokenUsages.totalToken = response.usage?.total_tokens  || 0
  return response.choices[0].message.content?.trim();
};

export let AIResponseTokenUsages: TtokenUsage = {
  inputToken: 0,
  outputToken: 0,
  totalToken: 0,
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
  
  AIResponseTokenUsages.inputToken = response.usage?.prompt_tokens  || 0
  AIResponseTokenUsages.outputToken = response.usage?.completion_tokens  || 0
  AIResponseTokenUsages.totalToken = response.usage?.total_tokens  || 0
  
  return response.choices[0].message.content?.trim();
};
