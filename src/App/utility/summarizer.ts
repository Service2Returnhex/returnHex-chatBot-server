import OpenAI from "openai";
import { botConfig } from "../config/botConfig";
import { IChatMessages } from "../Modules/Chatgpt/chat-history.model";

// Create OpenAI client lazily to ensure env variables are loaded
// const getOpenAIClient = () => {
//     return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// };
const openai=new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// console.log("summarize embedding env",openai);

export const messageSummarizer = async (oldMessages: IChatMessages[],
    oldSummary: string,
    maxToken: number = botConfig.messageSummarizerMaxToken) => {
    const text = oldMessages
        .map((m: IChatMessages) => `${m.role.toUpperCase()} : ${m.content}`)
        .join("\n")

    // const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model: botConfig.messageSummarizerModel,
        messages: [
            { role: "system", content: `Summarize by Keyword the following chat in ${maxToken} token:` },
            { role: "user", content: text + `old Summary: ${oldSummary}` }
        ],
        max_tokens: maxToken
    })
    console.log("summarize",response.usage);

    return response.choices[0].message.content?.trim();
}
export let AIResponseTotalToken : number =0;
export const AIResponse = async (promt: string, systemPromt: string, maxToken: number) => {
    // const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
        model: botConfig.NormaAIResponseModel,
        messages: [
            { role: "system", content: systemPromt },
            { role: "user", content: promt }
        ],
        max_tokens: maxToken
    })
console.log("Ai response",response.usage);
    return response.choices[0].message.content?.trim();
}