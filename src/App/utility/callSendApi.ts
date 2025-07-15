import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN!;

export const callSendAPI = (id: string, message: any) => {
  request(
    {
      uri: `https://graph.facebook.com/v${process.env.GRAPH_API_VERSION}/me/messages`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: { recipient: { id }, message },
    },
    (err) => {
      if (err) console.error("Send API error:", err);
    }
  );
};

export const privateReply = (commentId: string, text: string) => {
  request(
    {
      uri: `https://graph.facebook.com/v${process.env.GRAPH_API_VERSION}/${commentId}/private_replies`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: { message: text },
    },
    (err) => err && console.error("Private reply error:", err)
  );
};

export const publicReply = (commentId: string, text: string) => {
  request(
    {
      uri: `https://graph.facebook.com/v${process.env.GRAPH_API_VERSION}/${commentId}/replies`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: { message: text },
    },
    (err) => err && console.error("Public reply error:", err)
  );
};
