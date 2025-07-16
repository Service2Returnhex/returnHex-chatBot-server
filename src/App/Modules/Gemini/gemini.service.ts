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
    `https://graph.facebook.com/v23.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId }, 
      message: { text },
    }
  );
  console.log(res.data);
};

const replyToComment = async (commentId: string, message: string) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${commentId}/comments`,
      {
        message,
      },
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );
    console.log('✅ Comment reply sent:', response.data);
  } catch (error: any) {
    console.error('❌ Failed to reply to comment');
    if (error.response) {
      console.error(error.response.data);
    }
  }
};


export const GeminiService = {

    getResponse,
    sendMessage,
    replyToComment
}