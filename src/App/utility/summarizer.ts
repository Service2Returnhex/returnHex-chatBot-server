import { botConfig } from "../config/botConfig";
import { IChatMessages } from "../Modules/Chatgpt/chat-history.model";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const messageSummarizer = async (oldMessages: IChatMessages[], 
    oldSummary: string, 
    maxToken: number = botConfig.messageSummarizerMaxToken) => {
    const text = oldMessages
        .map((m: IChatMessages) => `${m.role.toUpperCase()} : ${m.content}`)
        .join("\n")

    const response = await openai.chat.completions.create({
        model: botConfig.messageSummarizerModel,
        messages: [
            { role: "system", content: `make the following chat in ${maxToken} token:` },
            { role: "user", content: text + `old Summary: ${oldSummary}`}
        ],
        max_tokens: maxToken
    })

    return response.choices[0].message.content?.trim();
}

export const AIResponse = async (promt: string, systemPromt: string, maxToken: number) => {
   
    const response = await openai.chat.completions.create({
        model: botConfig.NormaAIResponseModel,
        messages: [
            { role: "system", content: systemPromt },
            { role: "user", content: promt }
        ],
        max_tokens: maxToken
    })

    return response.choices[0].message.content?.trim();
}