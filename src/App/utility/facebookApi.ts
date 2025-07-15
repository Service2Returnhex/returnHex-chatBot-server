// src/utils/facebookApi.ts
import axios from "axios";
import { RequestResponse } from "request";

const PAGE_TOKEN =
  "EAAPC7kQLggkBPK4LWZCYZBhn02US8JCKndseh8l6UZAjPV24OYaDqTUZApfsxzUegfbiKZCCQAZACTlslgRnedpxeqnoKcZBZBEHn99wpXgZC2Dzvb4uo2AQzwbbZAm4jOJBJJoH7tqSuXD2pN4ImZBvdsGw0Aq7OSzHPj52ZCpD9ZAF5KHTVPudvjLPgY95jEBNHHLFcvQUZC2De8zaF0FpeInpZBtJ0gsg5Ke0Gidk1FIXHjzds2r7lYZD";
if (!PAGE_TOKEN) {
  throw new Error("Missing FB_PAGE_ACCESS_TOKEN in environment");
}

export async function sendTextMessage(
  senderId: string,
  text: string
): Promise<void> {
  const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_TOKEN}`;

  try {
    await axios.post(url, {
      recipient: { id: senderId },
      message: { text },
    });
    console.log(`Sent message to ${senderId}`);
  } catch (err: any) {
    console.error(
      "Error sending message via Send API:",
      err.response?.data || err.message
    );
  }
}

export async function replyToComment(
  commentId: string,
  message: string
): Promise<void> {
  const url = `https://graph.facebook.com/v17.0/${commentId}/comments?access_token=${PAGE_TOKEN}`;
  try {
    await axios.post(url, { message });
    console.log(`Replied to comment ${commentId}`);
  } catch (err: any) {
    console.error(
      "Error replying to comment:",
      err.response?.data || err.message
    );
  }
}

function handleError(error: any, response: RequestResponse, body: any): void {
  if (error) {
    console.error("Facebook API request error:", error);
  } else if (body && body.error) {
    console.error("Facebook API error response:", body.error);
  } else {
    console.log("Facebook API success:", body);
  }
}
