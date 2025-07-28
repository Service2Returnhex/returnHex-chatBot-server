import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { ChatHistory } from "./chat-history.model";
import { ShopInfo } from "../Page/shopInfo.model";
import { Product } from "../Page/product.mode";
import { CommentHistory } from "./comment-histroy.model";
import { makePromtComment, makePromtDM } from "../Page/shop.promt";

const getResponseDM = async (
  senderId: string,
  shopId: string,
  prompt: string,
  action?: string
) => {
  let userHistoryDoc = await ChatHistory.findOne({ senderId });
  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ senderId, messages: [] });
  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const shop = await ShopInfo.findOne({shopId});
  if (!shop) throw new Error("Shop not found");

  const products = await Product.find({shopId});

  //save the post info. to the local database
  // create a script for run makePromtDM
  /*
    is it same post - don't call makePromtDM
    is it different post - call the makePromtDM

   */

  const getPromt = makePromtDM(shop, products, prompt);

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPromt },
    { role: 'user', content: prompt}
  ];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
  });
  //replay should be in 20 token
  //if there is no replay, we will sent a custom response like - [our customer care will contact with you]
  // then the page owener will receive a email with post deatils that ai is not responding
  const reply = completion.choices[0].message.content || "";

  userHistoryDoc.messages.push({ role: "assistant", content: reply });
  await userHistoryDoc.save();

  //nlp: if same related question mathces with db, it will replay from the previous stored response. 
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
  userCommnetHistoryDoc.messages.push({ commentId, role: "user", content: message });

  const shop = await ShopInfo.findOne({shopId});
  if (!shop) throw new Error("Shop not found");

  const products = await Product.find({shopId});
  const specificProduct = await Product.findOne({ shopId, postId });

  const getPrompt = makePromtComment(shop, products, specificProduct);
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getPrompt },
    { role: "user", content: message}
  ];

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  const reply = `@[${commenterId}] ` + completion.choices[0].message.content;

  userCommnetHistoryDoc.messages.push({commentId, role: "assistant", content: reply });
  await userCommnetHistoryDoc.save();
  return reply;
};



export const ChatgptService = {
  getResponseDM,
  getCommnetResponse,
};
