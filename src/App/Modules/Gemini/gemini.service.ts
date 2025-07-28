import { GoogleGenAI } from "@google/genai";
import { ChatCompletionMessageParam } from "openai/resources/index";

import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { Product } from "../Page/product.mode";
import { makePromtComment, makePromtDM } from "../Page/shop.promt";
import { ShopInfo } from "../Page/shopInfo.model";

const textResponse = async (prompt: string) => {
  // console.log(prompt);
  const ai = new GoogleGenAI({});
  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const reply = completion.text || "";

  // userHistoryDoc.messages.push({ role: "assistant", content: reply });
  // await userHistoryDoc.save();
  return reply;
};

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

  const getPrompt = makePromtDM(shop, products, prompt);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    ...userHistoryDoc.messages,
  ];
  const geminiMessages = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  console.log(geminiMessages);

  const ai = new GoogleGenAI({});
  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: geminiMessages as ChatCompletionMessageParam[],
  });
  const reply = completion.text || "";

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
  pageId: string,
  action?: string
) => {
  console.log("comment message", message);
  console.log("comment commenterId", commenterId);
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
  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });

  const shop = await ShopInfo.findById(pageId);
  if (!shop) throw new Error("Shop not found");

  const products = await Product.find();
  const specificProduct = await Product.findOne({ postId });

  const getPrompt = makePromtComment(shop, products, specificProduct);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    ...userCommnetHistoryDoc.messages,
  ];
  const geminiMessages = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const ai = new GoogleGenAI({});
  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: geminiMessages as ChatCompletionMessageParam[],
  });
  // console.log("completion", completion);
  const result = await completion;

  const replyText =
    result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  const reply = `@[${commenterId}] ${replyText}`;
  console.log("reply", reply);

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "assistant",
    content: reply,
  });
  await userCommnetHistoryDoc.save();
  return reply;
};

export const GeminiService = {
  getResponseDM,
  getCommnetResponse,
  textResponse,
};
