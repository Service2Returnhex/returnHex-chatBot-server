import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { botConfig } from "../../config/botConfig";
import { AIResponseTokenUsages, messageSummarizer, messageSummarizerTokenUsages, TtokenUsage } from "../../utility/summarizer";
import { Order } from "../Page/order.model";
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

  if (!senderId) throw new Error("Missing senderId");
  if (!shopId) throw new Error("Missing shopId");

  const shop = await PageInfo.findOne({ shopId }).lean().exec();
  if (!shop) {
    console.warn("getResponseDM: shop not found for", shopId);
    throw new Error("Shop not found");
  }

  let userHistoryDoc = await ChatHistory.findOne({ userId: senderId, shopId }).exec();
  console.log("userHistoryDoc", userHistoryDoc);
  if (!userHistoryDoc) {
    userHistoryDoc = new ChatHistory({
      userId: senderId,
      shopId,
      messages: [],
      summary: "",
    });
  }

  const products = await Post.find({ shopId }).lean().exec();


  const getPromt = await makePromtDM(shop, products, senderId);
  try {
    if (Array.isArray(userHistoryDoc.messages) && userHistoryDoc.messages.length > botConfig.converstionThreshold) {
      const total = userHistoryDoc.messages.length;
      const keep = botConfig.keepMessages || 10;
      const oldMessages = userHistoryDoc.messages.slice(0, Math.max(0, total - keep));
      const recentMessages = userHistoryDoc.messages.slice(-keep);

      const summary = await messageSummarizer(shopId, oldMessages, userHistoryDoc?.summary || "", botConfig.messageSummarizerMaxToken);
      userHistoryDoc.summary = typeof summary === "string" ? summary : (summary || "");
      userHistoryDoc.messages = recentMessages;
    }
  } catch (err) {
    console.warn("getResponseDM: summarization failed:", (err as any)?.message || err);
  }

  userHistoryDoc.messages.push({
    role: "user",
    content: prompt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("getDmPrompt", getPromt);

  const messages = [] as { role: string; content: string }[];
  if (getPromt) messages.push({ role: "system", content: getPromt });
  if (userHistoryDoc.summary && String(userHistoryDoc.summary).trim().length > 0) {
    messages.push({ role: "system", content: "History summary: " + userHistoryDoc.summary });
  }
  for (const m of userHistoryDoc.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let reply = ""

  console.log("Hello")

  const completion = await openai.chat.completions.create({
    model: botConfig.mainAIModel,
    messages: messages.map((m) => ({ role: m.role as any, content: m.content })),
  });
  let mainAiTokenUsages: TtokenUsage = {
    inputToken: 0,
    outputToken: 0,
    totalToken: 0,
  };
  reply = completion.choices[0].message.content || "Something went wrong"; 
  console.log(reply);
  try {
    const parsed = JSON.parse(reply);

    if (parsed?.action === "confirmOrder") {
      const order = new Order({
        userId: senderId,
        shopId,
        customerName: parsed?.name || "N/A",
        productName: parsed?.productName || "N/A",
        quantity: parsed?.quantity || "N/A",
        address: parsed?.address || "N/A",
        contact: parsed?.contact || "N/A",
        paymentMethod: parsed?.paymentMethod || "N/A",
        status: "pending",
      });
      await order.save();

      reply = `✅ Your order for "${parsed.productName}" has been confirmed!`;
    }

    else if (parsed?.action === "updateOrder") {
      const updated = await Order.findOneAndUpdate(
        { _id: parsed.orderId, userId: senderId, shopId },
        { $set: parsed.updates, updatedAt: new Date() },
        { new: true }
      );

      if (updated) {
        reply = `🔄 Your order (${parsed.orderId}) - (${parsed?.updates?.productName}) has been updated successfully.`;
      } else {
        reply = `⚠️ Order not found or could not be updated.`;
      }
    }

    else if (parsed?.action === "getOrderStatus") {
      const order = await Order.findOne({
        _id: parsed.orderId,
        userId: senderId,
        shopId
      });

      if (order) {
        reply = `📦 Order (${parsed.orderId}) - (${parsed.productName}) status: "${order.status}".`;
      } else {
        reply = `⚠️ Order not found. Please check your Order ID.`;
      }
    }

    else if (parsed?.action === "cancelOrder") {
      const canceled = await Order.findOneAndUpdate(
        { _id: parsed.orderId, userId: senderId, shopId },
        { $set: { status: "cancelled", updatedAt: new Date() } },
        { new: true }
      );

      if (canceled) {
        reply = `❌ Your order (${parsed.orderId}) - (${parsed.productName}) has been cancelled.`;
      } else {
        reply = `⚠️ Order not found or could not be cancelled.`;
      }
    }
  } catch (error: any) {
    console.log(error.message);
  }

  mainAiTokenUsages.inputToken = completion.usage?.prompt_tokens || 0
  mainAiTokenUsages.outputToken = completion.usage?.completion_tokens || 0
  mainAiTokenUsages.totalToken = completion.usage?.total_tokens || 0

  const totalAITokenDetails: TtokenUsage = {
    inputToken: messageSummarizerTokenUsages.inputToken + AIResponseTokenUsages.inputToken + mainAiTokenUsages.inputToken,
    outputToken: messageSummarizerTokenUsages.outputToken + AIResponseTokenUsages.outputToken + mainAiTokenUsages.outputToken,
    totalToken: messageSummarizerTokenUsages.totalToken + AIResponseTokenUsages.totalToken + mainAiTokenUsages.totalToken,
  }

  console.log("Total DM Ai Token Details: ", totalAITokenDetails);

  await PageInfo.findOneAndUpdate(
    {shopId},
    {
      $inc: {
        inputToken: mainAiTokenUsages.inputToken,
        outputToken: mainAiTokenUsages.outputToken,
        totalToken: mainAiTokenUsages.totalToken,
      }
    },
    { new: true, upsert: true }
  )

  userHistoryDoc.messages.push({ role: "assistant", content: reply, createdAt: new Date(), updatedAt: new Date() });
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
      shopId,
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
    model: botConfig.mainAIModel,
    messages,
  });
  console.log("cmt message", completion.usage);
  let reply = completion.choices[0].message.content || "Something Went Wrong";
  reply = `@[${commenterId}] ${reply}`;
  let mainAiTokenUsages: TtokenUsage = {
    inputToken: 0,
    outputToken: 0,
    totalToken: 0,
  };

  mainAiTokenUsages.inputToken = completion.usage?.prompt_tokens || 0
  mainAiTokenUsages.outputToken = completion.usage?.completion_tokens || 0
  mainAiTokenUsages.totalToken = completion.usage?.total_tokens || 0

  const totalAITokenDetails: TtokenUsage = {
    inputToken: messageSummarizerTokenUsages.inputToken + AIResponseTokenUsages.inputToken + mainAiTokenUsages.inputToken,
    outputToken: messageSummarizerTokenUsages.outputToken + AIResponseTokenUsages.outputToken + mainAiTokenUsages.outputToken,
    totalToken: messageSummarizerTokenUsages.totalToken + AIResponseTokenUsages.totalToken + mainAiTokenUsages.totalToken,
  }

  console.log("Total Comment Token Usages: ", totalAITokenDetails);

  await PageInfo.findOneAndUpdate(
  { shopId },
  {
    $inc: {
      "tokenUsage.inputToken": mainAiTokenUsages.inputToken,
      "tokenUsage.outputToken": mainAiTokenUsages.outputToken,
      "tokenUsage.totalToken": mainAiTokenUsages.totalToken,
    },
  },
  { new: true, upsert: true }
);


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
