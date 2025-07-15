// if (!PAGE_TOKEN) throw new Error("Missing FB_PAGE_ACCESS_TOKEN");
import axios from "axios";
const PAGE_TOKEN =
  "EAAPC7kQLggkBPC2ZBASnIf31hb5VA9CI0zrKwq70uLXUYTI9Y4vfl20EvSCBL3XxuKMM9C40yApHFrZCy7qMikwAZCPhzWpYhGavN3bDeIt0nqW6GLwETMABMw01ZCgZCoszVZCxXNJULguRdKyiJ6H0F9uzuZChhQ0u4YQur3xzwC8GCYWwArWBXfzJcmXJeJuddMIIWmKLQZDZD";
// const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN!;
if (!PAGE_TOKEN) throw new Error("Missing FB_PAGE_ACCESS_TOKEN");

export const sendMessage = async (
  recipientId: string,
  text: string
): Promise<void> => {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/me/messages`,
      { recipient: { id: recipientId }, message: { text } },
      { params: { access_token: PAGE_TOKEN } }
    );
    console.log(`▶️ Sent Messenger reply to ${recipientId}`);
  } catch (err: any) {
    console.error(
      "❌ Messenger Send Error:",
      err.response?.data || err.message
    );
  }
};

export const replyToComment = async (
  commentId: string,
  message: string
): Promise<void> => {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${commentId}/comments`,
      { message },
      { params: { access_token: PAGE_TOKEN } }
    );
    console.log(`✔️ Replied to comment ${commentId}`);
  } catch (err: any) {
    console.error("❌ Comment Reply Error:", err.response?.data || err.message);
  }
};
