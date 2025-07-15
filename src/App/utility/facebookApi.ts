const PAGE_TOKEN =
  "EAAPC7kQLggkBPH1GjKbF48QiGCSgkXf2v2aVJJ4iIoPI6jvrKMzBWmzUEgl9L5DZBkmFoTai2R780jfh5CZAZBeimTyJRuYf9ZBY9adKJUkApeJLHKNkG8YqF02sThwb7NKrLfsYnHbt60K8E77i08oNmZBwZBUVm1PmmZCY857pUZCTjGcjLsAEyRQclc1CxBZCZCkDPmZADyRExL9uV1mZA5HnRGwBtxkTvYneOVqlmaQeHpZCvrgZDZD";
if (!PAGE_TOKEN) throw new Error("Missing FB_PAGE_ACCESS_TOKEN");
import axios from "axios";
// const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
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
