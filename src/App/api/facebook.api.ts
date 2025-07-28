import axios from "axios";

export const sendMessage = async (
  recipientId: string,
  text: string,
  pageAccessToken?: string
) => {
  const token = pageAccessToken;
  const res = await axios.post(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${token}`,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
  console.log(res.data);
};

export const replyToComment = async (
  commentId: string,
  message: string,
  pageAccessToken?: string
) => {
  const token = pageAccessToken;
  const response = await axios.post(
    `https://graph.facebook.com/v23.0/${commentId}/comments`,
    {
      message,
    },
    {
      params: {
        access_token: token,
      },
    }
  );
  console.log("✅ Comment reply sent:", response.data);
};
