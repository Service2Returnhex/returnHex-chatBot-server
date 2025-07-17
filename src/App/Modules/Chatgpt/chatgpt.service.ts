import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";
import axios from "axios";
import { ChatHistory } from "./chat-history.model";
import { ShopInfo } from "../Page/shopInfo.model";
import { Product } from "../Page/product.mode";

const getResponse = async (userId: string, prompt: string) => {
  let userHistoryDoc = await ChatHistory.findOne({ userId });

  if (!userHistoryDoc)
    userHistoryDoc = new ChatHistory({ userId, messages: [] });

  userHistoryDoc.messages.push({ role: "user", content: prompt });

  const shop = await ShopInfo.findById(process.env.SHOP_ID);
  if (!shop) {
    throw new Error("Shop not found");
  }

  const products = await Product.find();

  let productList = "";

  if (products.length > 0) {
    productList = products
      .map(
        (p, i) => `
${i + 1}. ${p.name}
   - Description: ${p.description}
   - Price: ${p.price}`
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

${products.length > 0 ? `list the product's what user wants smartly. Here is our product list: ${productList}` : ""}
  
Respond to the user’s message helpfully and naturally using the above context.
  `.trim();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...userHistoryDoc.messages,
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  const reply = completion.choices[0].message.content || "";

  userHistoryDoc.messages.push({ role: "assistant", content: reply });
  await userHistoryDoc.save();

  return reply;
};

export const sendMessage = async (recipientId: string, text: string) => {
  const res = await axios.post(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
  console.log(res.data);
};

const replyToComment = async (commentId: string, message: string) => {
  const response = await axios.post(
    `https://graph.facebook.com/v23.0/${commentId}/comments`,
    {
      message,
    },
    {
      params: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
      },
    }
  );
  console.log("✅ Comment reply sent:", response.data);
};

export const ChatgptService = {
  getResponse,
  sendMessage,
  replyToComment,
};
