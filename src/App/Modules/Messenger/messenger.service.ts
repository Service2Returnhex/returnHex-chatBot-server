import {
  callSendAPI,
  privateReply,
  publicReply,
} from "../../utility/callSendApi";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN!;

export const processMessage = (event: any) => {
  const sender = event.sender.id;
  if (event.message) {
    if (event.message.text) {
      callSendAPI(sender, { text: `You sent: "${event.message.text}"` });
    }
    // Attachments or postbacks...
  }
};

export const processCommentEvent = (value: any) => {
  const commentId = value.comment_id;
  const text = value.message;
  const reply = `Thanks for commenting: "${text}"!`;

  if (process.env.API_VERSION_SUPPORTS_PRIVATE === "true") {
    privateReply(commentId, reply);
  } else {
    publicReply(commentId, reply);
  }
};
