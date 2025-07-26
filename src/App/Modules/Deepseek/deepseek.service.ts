//not completed(credit issues)
import { ChatCompletionMessageParam } from "openai/resources/index";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-history.model";
import { Product } from "../Page/product.mode";
import { makePromtComment, makePromtDM } from "../Page/shop.promt";
import { ShopInfo } from "../Page/shopInfo.model";

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

  const getPrompt = makePromtDM(shop, products);
  //   const getPromt = makePromtComment(shop, products, specificProduct);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    ...userHistoryDoc.messages,
  ];

  console.log(process.env.OPEN_ROUTER_API_KEY);
  // const openai = new OpenAI({
  //   baseURL: 'https://openrouter.ai/api/v1',
  //   apiKey: process.env.OPEN_ROUTER_API_KEY,
  // });
  // const completion = await openai.chat.completions.create({
  //   model: "deepseek/deepseek-chat:free",
  //   messages,
  // });

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages,
      }),
    }
  );

  const completion = await response.json();

  // Extract the reply safely
  const reply =
    completion.choices?.[0]?.message?.content?.trim() ??
    "Sorry, I couldn't generate a response.";

  userHistoryDoc.messages.push({ role: "assistant", content: reply });
  await userHistoryDoc.save();
  return completion;
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

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });

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

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1:free",
      messages,
    }),
  });

  const json = await resp.json();
  if (json.error) {
    console.error("DeepSeek API error:", json.error);
    throw new Error(json.error.message);
  }

  // 6) Extract only the reply text
  const coreReply =
    json.choices?.[0]?.message?.content?.trim() ??
    "Sorry, I couldn't generate a response.";

  const reply = `@[${commenterId}] ` + coreReply;
  //   console.log("commentReply", reply);

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "assistant",
    content: reply,
  });
  await userCommnetHistoryDoc.save();
  return reply;
};

export const DeepSeekService = {
  getResponseDM,
  getCommnetResponse,
};
