import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { ShopInfo } from "../Page/shopInfo.model";
import { Product } from "../Page/product.mode";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { makePromtComment, makePromtDM } from "../Page/shop.promt";

const getResponseDM = async (
  userId: string,
  prompt: string,
  action?: string
) => {
  let userHistoryDoc = await ChatHistory.findOne({ userId });

  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ userId, messages: [] });

  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find();

  const getPrompt = makePromtDM(shop, products, prompt);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt }, //as much as optimize
    { role: "user", content: prompt }
  ];

  console.log(messages);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek/deepseek-r1:free',
    messages,
  }),
});
  
  const completion = await response.json();

  const reply = completion.choices[0].message.content || 
  "Sorry, Something went wrong, Owner will reach you soon!";

  userHistoryDoc.messages.push({ role: "assistant", content: reply });
  await userHistoryDoc.save();
  return reply;
};

export const getCommnetResponse = async (
  commenterId: string,
  commentId: string,
  userName: string,
  message: string,
  postId: string,
  action?: string
) => {
  let userCommnetHistoryDoc = await CommentHistory.findOne({
    userId: commenterId,
    postId,
  });

  if (!userCommnetHistoryDoc)
    userCommnetHistoryDoc = new CommentHistory({
      userId: commenterId,
      commentId,
      postId,
      userName,
      messages: [],
    });

  userCommnetHistoryDoc.messages.push({ commentId, role: "user", content: message });

  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find();
  const specificProduct = await Product.findOne({ postId });

  const getPromt = makePromtComment(shop, products, specificProduct);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPromt },
    ...userCommnetHistoryDoc.messages,
  ];

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages,
  });
  const reply = `@[${commenterId}] ` + completion.choices[0].message.content;

  userCommnetHistoryDoc.messages.push({commentId, role: "assistant", content: reply });
  await userCommnetHistoryDoc.save();
  return reply;
};

export const DeepSeekService = {
  getResponseDM,
  getCommnetResponse,
};
