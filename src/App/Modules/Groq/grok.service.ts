import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
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
  let userHistoryDoc = await ChatHistory.findOne({ userId: senderId });
  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ userId: senderId, messages: [] });

  const shop = await PageInfo.findOne({ shopId });
  if (!shop) throw new Error("Shop not found");

  const products = await Post.find({ shopId });

  const getPrompt = makePromtDM(shop, products, userHistoryDoc.messages);
  userHistoryDoc.messages.push({ role: "user", content: prompt });


  const cleanedMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "user", content: prompt },
  ];

  console.log(process.env.GROQ_API_KEY);
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: cleanedMessages,
  });
  const reply = completion.choices[0]?.message?.content || "";

  userHistoryDoc.messages.push({ role: "assistant", content: reply });
  await userHistoryDoc.save();
  console.log("coming form groq");
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

  const getPrompt = makePromtComment(shop, products, specificProduct, userCommnetHistoryDoc.messages);
  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });
  const cleanedMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "user", content: message },
  ];
  console.log("coming from groq");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: cleanedMessages,
  });
  const reply =
    `@[${commenterId}] ` + completion.choices[0]?.message?.content || "";

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "assistant",
    content: reply,
  });
  await userCommnetHistoryDoc.save();
  return reply;
};

export const GroqService = {
  getResponseDM,
  getCommnetResponse,
};
