// if (!PAGE_TOKEN) throw new Error("Missing FB_PAGE_ACCESS_TOKEN");
import axios from "axios";
const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN!;
if (!PAGE_TOKEN) throw new Error("Missing FB_PAGE_ACCESS_TOKEN");

export const sendMessage = async (
  recipientId: string,
  text: string
): Promise<void> => {
  const cleanText =
    typeof text === "string" ? text : "Sorry, something went wrong 🤖";
  // console.log("▶️ Sending to PSID:", recipientId, "Text:", cleanText);
  try {
    await axios.post(
      `https://graph.facebook.com/v23.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: recipientId },
        message: { text: cleanText },
      }
    );
    console.log(`▶️ Sent Messenger reply to ${recipientId}`);
  } catch (err: any) {
    console.error(
      "❌ Messenger Send Error:",
      err.response?.status,
      JSON.stringify(err.response?.data, null, 2) || err.message
    );
  }
};

export const replyToComment = async (
  commentId: string,
  message: string
): Promise<void> => {
  try {
    await axios.post(
      `https://graph.facebook.com/v23.0/${commentId}/comments`,
      { message },
      { params: { access_token: PAGE_TOKEN } }
    );
    console.log(`✔️ Replied to comment ${commentId}`);
  } catch (err: any) {
    console.error("❌ Comment Reply Error:", err.response?.data || err.message);
  }
};
