import { GoogleGenAI } from "@google/genai";
import { ChatCompletionMessageParam } from "openai/resources/index";

import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { makePromtComment, makePromtDM } from "../Page/page.promt";
import { PageInfo } from "../Page/pageInfo.model";
import { Post } from "../Page/post.mode";

const getResponseDM = async (
  senderId: string,
  shopId: string,
  prompt: string,
  action?: string
) => {
  let userHistoryDoc = await ChatHistory.findOne({ senderId });
  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ senderId, messages: [] });

  const shop = await PageInfo.findOne({ shopId });
  if (!shop) throw new Error("Shop not found");

  const products = await Post.find({ shopId });

  const getPrompt = await makePromtDM(shop, products, userHistoryDoc.messages);
  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "user", content: getPrompt },
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
  shopId: string,
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

  const shop = await PageInfo.findOne({ shopId });
  if (!shop) throw new Error("Shop not found");

  const products = await Post.find({ shopId });
  const specificProduct = await Post.findOne({ shopId, postId });

  const getPrompt =await makePromtComment(
    shop,
    products,
    specificProduct,
    userCommnetHistoryDoc.messages
  );
  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "user", content: message },
  ];
  const geminiMessages = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const ai = new GoogleGenAI({});
  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: geminiMessages as ChatCompletionMessageParam[],
  });
  const reply = `@[${commenterId}] ` + completion.text || "";

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
};
