import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { makePromtComment, makePromtDM } from "../Page/page.promt";
import { PageInfo } from "../Page/pageInfo.model";
import { Post } from "../Page/post.mode";
import { ChatHistory } from "./chat-history.model";
import { CommentHistory } from "./comment-histroy.model";

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

  const getPromt = makePromtDM(shop, products, userHistoryDoc.messages);

  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPromt },
    { role: "user", content: prompt },
  ];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
  });

  const reply = completion.choices[0].message.content || "Something Went Wrong";

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

  const getPrompt = makePromtComment(shop, products, specificProduct, userCommnetHistoryDoc.messages);
  
  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "user", content: message },
  ];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages,
  });
  const reply = completion.choices[0].message.content || "Something Went Wrong"

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "assistant",
    content: reply,
  });
  await userCommnetHistoryDoc.save();
  return reply;
};

export const ChatgptService = {
  getResponseDM,
  getCommnetResponse,
};
