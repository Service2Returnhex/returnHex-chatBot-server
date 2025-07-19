import axios from 'axios'

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

export const replyToComment = async (commentId: string, message: string) => {
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