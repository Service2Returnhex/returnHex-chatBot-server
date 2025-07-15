import { replyToComment, sendMessage } from "../../utility/facebookApi";

export async function processMessageEvent(event: any): Promise<void> {
  if (event.message?.is_echo) return;
  const senderId = event.sender?.id;
  const txt = event.message?.text;
  if (senderId && txt) {
    const reply = `Echo: ${txt}`;
    await sendMessage(senderId, reply);
  }
}

export async function processCommentEvent(change: any): Promise<void> {
  const val = change.value;
  if (
    change.field === "feed" &&
    val.item === "comment" &&
    val.verb === "add" &&
    val.comment_id &&
    val.message
  ) {
    const reply = `Thanks for commenting: "${val.message}"`;
    await replyToComment(val.comment_id, reply);
  }
}
