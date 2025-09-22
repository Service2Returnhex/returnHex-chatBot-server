import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { makePromtComment, makePromtDM } from "../Page/page.promt";
import { PageInfo } from "../Page/pageInfo.model";
import { Post } from "../Page/post.mode";
import { ChatHistory } from "./chat-history.model";
import { CommentHistory } from "./comment-histroy.model";
import { AIResponseTokenUsages, messageSummarizer, messageSummarizerTokenUsages, TtokenUsage } from "../../utility/summarizer";
import { botConfig } from "../../config/botConfig";

const getResponseDM = async (
  senderId: string,
  shopId: string,
  prompt: string,
  action?: string
) => {

  if (!senderId) throw new Error("Missing senderId");
  if (!shopId) throw new Error("Missing shopId");

  // normalize prompt
  const userPrompt = (prompt || "").toString().trim();

  // 1) ensure shop exists
  const shop = await PageInfo.findOne({ shopId }).lean().exec();
  if (!shop) {
    console.warn("getResponseDM: shop not found for", shopId);
    throw new Error("Shop not found");
  }

  // 2) find or create chat history for this (userId, shopId) pair
  let userHistoryDoc = await ChatHistory.findOne({ userId: senderId, shopId }).exec();
  if (!userHistoryDoc) {
    userHistoryDoc = new ChatHistory({
      userId: senderId,
      shopId,
      messages: [],
      summary: "",
    });
  }

  // 3) load products (if you include product-data in system prompt)
  const products = await Post.find({ shopId }).lean().exec();
  // const systemPrompt = (await makePromtDM(shop, products)) || "";

  const getPromt = await makePromtDM(shop, products);

  // userHistoryDoc.messages.push({ role: "user", content: prompt });

    // 4) summarization step if history too long
  try {
    if (Array.isArray(userHistoryDoc.messages) && userHistoryDoc.messages.length > botConfig.converstionThreshold) {
      const total = userHistoryDoc.messages.length;
      const keep = botConfig.keepMessages || 10;
      const oldMessages = userHistoryDoc.messages.slice(0, Math.max(0, total - keep));
      const recentMessages = userHistoryDoc.messages.slice(-keep);

      const summary = await messageSummarizer(oldMessages, userHistoryDoc?.summary || "", botConfig.messageSummarizerMaxToken);
      userHistoryDoc.summary = typeof summary === "string" ? summary : (summary || "");
      userHistoryDoc.messages = recentMessages;
    }
  } catch (err) {
    console.warn("getResponseDM: summarization failed:", (err as any)?.message || err);
    // don't fail whole flow — continue without updated summary
  }

   // 5) push user message into history (with timestamps)
  userHistoryDoc.messages.push({
    role: "user",
    content: prompt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("getDmPrompt", getPromt);

   // 6) build messages payload for the model
  const messages = [] as { role: string; content: string }[];
  if (getPromt) messages.push({ role: "system", content: getPromt });
  if (userHistoryDoc.summary && String(userHistoryDoc.summary).trim().length > 0) {
    messages.push({ role: "system", content: "History summary: " + userHistoryDoc.summary });
  }
  for (const m of userHistoryDoc.messages) {
    messages.push({ role: m.role, content: m.content });
  }

    // 7) call AI provider (use lazy client factory recommended)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let reply =""
  const completion = await openai.chat.completions.create({
    model: botConfig.mainAIModel,
    messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
  });
  reply = completion.choices[0].message.content || "Something went wrong";
  let mainAiTokenUsages: TtokenUsage = {
    inputToken: 0,
    outputToken: 0,
    totalToken: 0,
  };

  mainAiTokenUsages.inputToken = completion.usage?.prompt_tokens  || 0
  mainAiTokenUsages.outputToken = completion.usage?.completion_tokens|| 0
  mainAiTokenUsages.totalToken = completion.usage?.total_tokens  || 0

  const totalAITokenDetails: TtokenUsage = {
    inputToken: messageSummarizerTokenUsages.inputToken + AIResponseTokenUsages.inputToken + mainAiTokenUsages.inputToken,
    outputToken: messageSummarizerTokenUsages.outputToken + AIResponseTokenUsages.outputToken + mainAiTokenUsages.outputToken,
    totalToken: messageSummarizerTokenUsages.totalToken + AIResponseTokenUsages.totalToken + mainAiTokenUsages.totalToken,
  }

  console.log("Total Ai Token Details: ", totalAITokenDetails);
  reply = completion.choices[0].message.content || "Something went wrong";

    if (!reply || !reply.trim()) {
      console.warn("getResponseDM: AI returned empty reply");
      reply = "দুঃখিত — আমি ঠিকভাবে বুঝতে পারিনি, আপনি কি একটু ভিন্নভাবে বলবেন?";
    }
  

  userHistoryDoc.messages.push({ role: "assistant", content: reply ,createdAt: new Date(), updatedAt: new Date()});
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
      shopId,
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
    createdAt: new Date(),
    updatedAt: new Date()
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
    model: "gpt-5-mini",
    messages,
  });
console.log("cmt message",completion.usage);
  let reply = completion.choices[0].message.content || "Something Went Wrong";
  reply = `@[${commenterId}] ${reply}`;
  let mainAiTokenUsages: TtokenUsage = {
    inputToken: 0,
    outputToken: 0,
    totalToken: 0,
  };

  mainAiTokenUsages.inputToken = completion.usage?.prompt_tokens  || 0
  mainAiTokenUsages.outputToken = completion.usage?.completion_tokens|| 0
  mainAiTokenUsages.totalToken = completion.usage?.total_tokens  || 0

  const totalAITokenDetails: TtokenUsage = {
    inputToken: messageSummarizerTokenUsages.inputToken + AIResponseTokenUsages.inputToken + mainAiTokenUsages.inputToken,
    outputToken: messageSummarizerTokenUsages.outputToken + AIResponseTokenUsages.outputToken + mainAiTokenUsages.outputToken,
    totalToken: messageSummarizerTokenUsages.totalToken + AIResponseTokenUsages.totalToken + mainAiTokenUsages.totalToken,
  }

  console.log(totalAITokenDetails);
  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "assistant",
    content: reply,
    createdAt: new Date(), updatedAt: new Date()
  });


  await userCommnetHistoryDoc.save();
  return reply;
};

export const ChatgptService = {
  getResponseDM,
  getCommnetResponse,
};
