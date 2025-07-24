import axios from "axios";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { Product } from "../Page/product.mode";
import { ShopInfo } from "../Page/shopInfo.model";

const getResponse = async (userId: string, prompt: string, postId?: string) => {
  let userHistoryDoc = await ChatHistory.findOne({ userId });

  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ userId, messages: [] });

  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find();
  const specificProduct = await Product.findOne({ postId });
  console.log("specificProduct", specificProduct);

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
You are a friendly travel assistant for ${shop.pageName} in ${
    shop.pageCategory
  }.
  
    Here is the shop info:
    - PageName: ${shop.pageName}
    - Category: ${shop.pageCategory}
    - Address: ${shop?.address}
    - Phone: ${shop?.phone}
  
   ${
     products.length > 0
       ? `We offer the following tours/packages:

${productList}

If any tour is missing Description or Price, please refer to MoreDetails.`
       : ""
   }

Respond to the user's inquiry in a helpful and natural manner using the context above.

${
  specificProduct
    ? `User is asking about this tour:

- Tour Name: ${specificProduct.name}
- Description: ${specificProduct.description}
- Price: ${specificProduct.price}
- Details: ${specificProduct.message}`
    : ""
}
  
    `.trim();

  const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...userHistoryDoc.messages,
  ];

  const completion = await openai.chat.completions.create({
    model: "grok-2",
    messages,
  });

  const reply = completion.choices[0].message.content || "";

  userHistoryDoc.messages.push({ role: "assistant", content: reply });
  await userHistoryDoc.save();

  return reply;
};

export const sendMessage = async (recipientId: string, text: string) => {
  console.log("text", text);
  const res = await axios.post(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
  console.log("res", res);
};

const replyToComment = async (commentId: string, message: string) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${commentId}/comments`,
      {
        message: `@${commentId} ${message}`,
      },
      {
        params: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
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

export const GrokService = {
  getResponse,
  sendMessage,
  replyToComment,
};
