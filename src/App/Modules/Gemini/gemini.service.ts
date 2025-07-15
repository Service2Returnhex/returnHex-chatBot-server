import { GoogleGenAI } from "@google/genai";
import axios from 'axios';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const getResponse = async (promt: string) => {
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promt
    })

    return response.text;
}

export const sendMessage = async (recipientId: string, text: string) => {
  const res = await axios.post(
    `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
};

export const replyToComment = async (commentId: string, text: string) => {
  const res = await axios.post(
    `https://graph.facebook.com/v18.0/${commentId}/comments?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      message: text,
    }
  );
};

export const GeminiService = {

    getResponse,
    sendMessage,
    replyToComment
}