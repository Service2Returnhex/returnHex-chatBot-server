import { ChatCompletionMessageParam } from "openai/resources/index";
import { ShopInfo } from "../Page/shopInfo.model";
import { Product } from "../Page/product.mode";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { makePromtComment, makePromtDM } from "../Page/shop.promt";

const getResponseDM = async (
  senderId: string,
  shopId: string,
  prompt: string,
  action?: string
) => {
  let userHistoryDoc = await ChatHistory.findOne({ userId: senderId });

  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ userId: senderId, messages: [] });

  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const shop = await ShopInfo.findOne({ shopId });
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find({ shopId });

  const getPrompt = makePromtDM(shop, products, prompt);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt }, //as much as optimize
    { role: "user", content: prompt },
  ];

  console.log(messages);

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
  console.log(completion);

  if (completion.error) {
    console.error("OpenRouter API Error:", completion.error);
    return "Sorry, something went wrong on our end. The admin will check this shortly!";
  }

  const reply =
    completion.choices?.[0]?.message?.content ||
    "Sorry, something went wrong. Please try again later.";

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

  userCommnetHistoryDoc.messages.push({
    commentId,
    role: "user",
    content: message,
  });

  const shop = await ShopInfo.findOne({ shopId });
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find({ shopId });
  const specificProduct = await Product.findOne({ shopId, postId });

  const getPromt = makePromtComment(shop, products, specificProduct);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPromt },
    { role: "user", content: message },
  ];
  console.log("coming from deepseek");
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
  console.log(completion);
  const reply = `@[${commenterId}] ` + completion.choices[0]?.message?.content;

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
