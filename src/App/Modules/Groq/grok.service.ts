import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
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
  if (!shop) throw new Error("Shop not found");

  const products = await Product.find();

  const getPrompt = makePromtDM(shop, products);
  
  const cleanedMessages: ChatCompletionMessageParam[] = [
  { role: "system", content: getPrompt },
  ...userHistoryDoc.messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  })),
];
  

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  console.log("coming form groq");

  const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: cleanedMessages
    })
  const reply = completion.choices[0]?.message?.content || "";

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
  if (!shop) throw new Error("Shop not found");
    
  const products = await Product.find();
  const specificProduct = await Product.findOne({ postId });

  
  const getPrompt = makePromtComment(shop, products, specificProduct);
  const cleanedMessages: ChatCompletionMessageParam[] = [
  { role: "system", content: getPrompt },
  ...userCommnetHistoryDoc.messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  })),
];
  console.log("coming from groq");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: cleanedMessages
    })
  const reply = `@[${commenterId}] ` + completion.choices[0]?.message?.content || "";

  userCommnetHistoryDoc.messages.push({commentId, role: "assistant", content: reply });
  await userCommnetHistoryDoc.save();
  return reply;
};

export const GroqService = {
  getResponseDM,
  getCommnetResponse,
};
