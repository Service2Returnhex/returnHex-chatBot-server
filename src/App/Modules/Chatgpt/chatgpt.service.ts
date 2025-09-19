import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { makePromtComment, makePromtDM } from "../Page/page.promt";
import { PageInfo } from "../Page/pageInfo.model";
import { Post } from "../Page/post.mode";
import { ChatHistory } from "./chat-history.model";
import { CommentHistory } from "./comment-histroy.model";
import { messageSummarizer } from "../../utility/summarizer";
import { botConfig } from "../../config/botConfig";

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

  const getPromt = await makePromtDM(shop, products);

  userHistoryDoc.messages.push({ role: "user", content: prompt });

  if (userHistoryDoc.messages.length > botConfig.converstionThreshold) {
    const oldMessages = userHistoryDoc.messages.slice(
      0,
      userHistoryDoc.messages.length - botConfig.keepMessages
    );

    const recentMessages = userHistoryDoc.messages.slice(-botConfig.keepMessages);

    const summary = await messageSummarizer(
      oldMessages,
      userHistoryDoc?.summary,
      botConfig.messageSummarizerMaxToken
    );

    userHistoryDoc.summary = summary as string;
    userHistoryDoc.messages = recentMessages;
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPromt },
    { role: "system", content: "History summary: " + userHistoryDoc.summary },
    ...userHistoryDoc.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: botConfig.mainAIModel,
    messages,
  });
  const reply = completion.choices[0].message.content || "Something went wrong";

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

  const getPrompt = await makePromtComment(
    shop,
    products,
    specificProduct,
  );

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });

  if (userCommnetHistoryDoc.messages.length > botConfig.commentThreshold) {
    const oldComments = userCommnetHistoryDoc.messages.slice(
      0,
      userCommnetHistoryDoc.messages.length - botConfig.keepComments
    );

    const recentComments = userCommnetHistoryDoc.messages.slice(-botConfig.keepComments);

    const summary = await messageSummarizer(
      oldComments,
      userCommnetHistoryDoc?.summary,
      botConfig.messageSummarizerMaxToken
    );

    userCommnetHistoryDoc.summary = summary as string;
    userCommnetHistoryDoc.messages = recentComments;
  }


  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "system", content: "History summary: " + userCommnetHistoryDoc.summary },
    ...userCommnetHistoryDoc.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model:  botConfig.mainAIModel,
    messages,
  });

  let reply = completion.choices[0].message.content || "Something Went Wrong";
  reply = `@[${commenterId}] ${reply}`;

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
