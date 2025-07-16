import OpenAI from "openai";
import axios from "axios";

const getResponse = async(promt: string) => {

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
            {
                role: "user",
                content: promt
            }
        ]
    })
    return result.choices[0].message.content
}

export const sendMessage = async (recipientId: string, text: string) => {
  const res = await axios.post(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId }, 
      message: { text },
    }
  );
  console.log(res.data);
};

const replyToComment = async (commentId: string, message: string) => {
    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${commentId}/comments`,
      {
        message,
      },
      {
        params: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
        },
      }
    );
    console.log('✅ Comment reply sent:', response.data);
};

export const ChatgptService = {
    getResponse,
    sendMessage,
    replyToComment
}