import { IChatMessages } from "../Modules/Chatgpt/chat-history.model";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const messageSummarizer = async (oldMessages: IChatMessages[], oldSummary: string, maxToken: number) => {
    const text = oldMessages
        .map((m: IChatMessages) => `${m.role.toUpperCase()} : ${m.content}`)
        .join("\n")

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: "system", content: `Summarize the following chat in ${maxToken} tokens:` },
            { role: "user", content: text + `old Summary: ${oldSummary}`}
        ],
        max_tokens: maxToken
    })

    return response.choices[0].message.content?.trim();
}

export const AIResponse = async (promt: string, systemPromt: string, maxToken: number) => {
   
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: "system", content: systemPromt },
            { role: "user", content: promt }
        ],
        max_tokens: maxToken
    })

    return response.choices[0].message.content?.trim();
}