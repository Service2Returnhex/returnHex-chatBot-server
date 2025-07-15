// src/utils/facebookApi.ts
import request, { RequestResponse } from "request";

const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// if (!PAGE_TOKEN) {
//   throw new Error("Missing FB_PAGE_ACCESS_TOKEN in environment");
// }

export function sendTextMessage(senderId: string, text: string): void {
  const url = `https://graph.facebook.com/v17.0/me/messages`;

  request(
    {
      uri: url,
      qs: { access_token: PAGE_TOKEN },
      method: "POST",
      json: {
        recipient: { id: senderId },
        message: { text },
      },
    },
    handleError
  );
}

export function replyToComment(commentId: string, message: string): void {
  const url = `https://graph.facebook.com/v17.0/${commentId}/comments`;

  request(
    {
      uri: url,
      qs: { access_token: PAGE_TOKEN },
      method: "POST",
      json: {
        message,
      },
    },
    handleError
  );
}

function handleError(error: any, response: RequestResponse, body: any): void {
  if (error) {
    console.error("Facebook API request error:", error);
  } else if (body && body.error) {
    console.error("Facebook API error response:", body.error);
  }
}
