// src/api/whatsapp.api.ts
import axios from "axios";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_VERSION = process.env.WHATSAPP_API_VERSION || "v17.0";

if (!ACCESS_TOKEN) {
  console.warn("WHATSAPP_ACCESS_TOKEN is not set!");
}

export async function sendTextMessage(
  to: string, // in E.164 e.g. "8801XXXXXXXXX"
  phoneNumberId: string, // your registered whatsapp phone number id
  text: string
) {
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
}

// extra helpers you might need:
export async function sendTemplateMessage(
  phoneNumberId: string,
  to: string,
  templatePayload: any
) {
  const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
  const res = await axios.post(url, templatePayload, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
