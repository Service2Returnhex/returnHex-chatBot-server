import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import axios from "axios";

const userHistories = new Map<string, ChatCompletionMessageParam[]>();

const getResponse = async (userId: string, prompt: string) => {
  let history = userHistories.get(userId) || [];
  history.push({ role: "user", content: prompt } as ChatCompletionMessageParam);
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant" } as ChatCompletionMessageParam,
      ...history,
    ],
  });

  const reply = completion.choices[0].message.content || "";

  history.push({ role: "assistant", content: reply } as ChatCompletionMessageParam);
  userHistories.set(userId, history);
  return reply;
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
  console.log("✅ Comment reply sent:", response.data);
};

export const ChatgptService = {
  getResponse,
  sendMessage,
  replyToComment,
};
