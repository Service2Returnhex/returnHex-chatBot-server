import OpenAI from "openai";
import { botConfig } from "../config/botConfig";
import { IChatMessages } from "../Modules/Chatgpt/chat-history.model";
import { PageInfo } from "../Modules/Page/pageInfo.model";
import { Logger, LogPrefix, LogService } from "./Logger";


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
  shopId: string,
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
    Your task is to create a structured summary of the conversation and old summary. 
    - Do not omit or lose any important information. 
    - Preserve all facts, questions, answers, and decisions. 
    - Maintain chronological order. 
    - Use concise sentences but keep all details. 
    - If the summary exceeds ${maxToken} tokens, compress wording but never remove information.`,
      },
      { role: "user", content: text + `old Summary: ${oldSummary}` },
    ],
    max_tokens: maxToken,
  });
  messageSummarizerTokenUsages.inputToken = response.usage?.prompt_tokens  || 0
  messageSummarizerTokenUsages.outputToken = response.usage?.completion_tokens|| 0
  messageSummarizerTokenUsages.totalToken = response.usage?.total_tokens  || 0

  await PageInfo.findOneAndUpdate(
  { shopId },
  {
    $inc: {
      "tokenUsage.inputToken": messageSummarizerTokenUsages.inputToken,
      "tokenUsage.outputToken": messageSummarizerTokenUsages.outputToken,
      "tokenUsage.totalToken": messageSummarizerTokenUsages.totalToken,
    },
  },
  { new: true, upsert: true }
);


  return response.choices[0].message.content?.trim();
};

export let AIResponseTokenUsages: TtokenUsage = {
  inputToken: 0,
  outputToken: 0,
  totalToken: 0,
};

export const AIResponse = async (
  shopId: string,
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

  try {
    await PageInfo.findOneAndUpdate(
  { shopId },
  {
    $inc: {
      "tokenUsage.inputToken": AIResponseTokenUsages.inputToken,
      "tokenUsage.outputToken": AIResponseTokenUsages.outputToken,
      "tokenUsage.totalToken": AIResponseTokenUsages.totalToken,
    },
  },
  { new: true, upsert: true }
);

  } catch (error: any) {
    Logger(LogService.DB, LogPrefix.SHOP, "Shop Creating For the First Time!!")
  }

  return response.choices[0].message.content?.trim();
}

