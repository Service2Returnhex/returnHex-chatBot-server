import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { Product } from "../Page/product.mode";
import { ShopInfo } from "../Page/shopInfo.model";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const getResponse = async (userId: string, promt: string, postId?: string) => {
  let userHistoryDoc = await ChatHistory.findOne({ userId });

  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ userId, messages: [] });

  userHistoryDoc.messages.push({ role: "user", content: promt });

  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find();
  const specificProduct = await Product.findOne({ postId });

  let productList = "";

  if (products.length > 0) {
    productList = products
      .map(
        (p, i) => `
${i + 1}. ${p.name}
   - Description: ${p.description}
   - Price: ${p.price}
   - MoreDetails: ${p.message}`
      )
      .join("\n\n");
  }

  const systemPrompt = `
  You are an AI assistant for a Facebook page that sells products.

  Here is the shop info:
  - PageName: ${shop.pageName}
  - Category: ${shop.pageCategory}
  - Address: ${shop?.address}
  - Phone: ${shop?.phone}

  ${
    products.length > 0
      ? `list the product's what user wants smartly. Here is our product list: ${productList}
  if the product list's Description and Price part is missing try to find post details from MoreDetails`
      : ""
  }
  Respond to the user's message helpfully and naturally using the above context.
  
  ${
    specificProduct
      ? `User Wants to know about this product either in comment or meesage:
  - Product Name: ${specificProduct.name}
  - Description: ${specificProduct.description}
  - Price: ${specificProduct.price}
  - MoreDetails: ${specificProduct.message}`
      : ""
  }

  `.trim();

  const ai = new GoogleGenAI({});

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: promt,
  });

  return response.text;
};

export const sendMessage = async (recipientId: string, text: string) => {
  const res = await axios.post(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
  console.log(res.data);
};

const replyToComment = async (commentId: string, message: string) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${commentId}/comments`,
      {
        message,
      },
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );
    console.log("✅ Comment reply sent:", response.data);
  } catch (error: any) {
    console.error("❌ Failed to reply to comment");
    if (error.response) {
      console.error(error.response.data);
    }
  }
};

export const GeminiService = {
  getResponse,
  sendMessage,
  replyToComment,
};
