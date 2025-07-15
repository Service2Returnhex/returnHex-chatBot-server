import axios from "axios";

// const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const PAGE_TOKEN =
  "EAAPC7kQLggkBPK4LWZCYZBhn02US8JCKndseh8l6UZAjPV24OYaDqTUZApfsxzUegfbiKZCCQAZACTlslgRnedpxeqnoKcZBZBEHn99wpXgZC2Dzvb4uo2AQzwbbZAm4jOJBJJoH7tqSuXD2pN4ImZBvdsGw0Aq7OSzHPj52ZCpD9ZAF5KHTVPudvjLPgY95jEBNHHLFcvQUZC2De8zaF0FpeInpZBtJ0gsg5Ke0Gidk1FIXHjzds2r7lYZD";
if (!PAGE_TOKEN) throw new Error("Missing FB_PAGE_ACCESS_TOKEN");

export const sendMessage = async (
  recipientId: string,
  text: string
): Promise<void> => {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages`,
    { recipient: { id: recipientId }, message: { text } },
    { params: { access_token: PAGE_TOKEN } }
  );
};

export const replyToComment = async (
  commentId: string,
  message: string
): Promise<void> => {
  await axios.post(
    `https://graph.facebook.com/v17.0/${commentId}/comments`,
    { message },
    { params: { access_token: PAGE_TOKEN } }
  );
};
