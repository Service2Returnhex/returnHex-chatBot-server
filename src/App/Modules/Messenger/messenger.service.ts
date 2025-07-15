import { replyToComment, sendMessage } from "../../utility/facebookApi";
import { FeedChange, MessengerEvent } from "./fb-webhook";

export async function processMessageEvent(
  event: MessengerEvent
): Promise<void> {
  if (event.message?.is_echo) return;
  const senderId = event.sender?.id;
  const text = event.message?.text;
  if (senderId && text) {
    await sendMessage(senderId, `You said: ${text}`);
  }
}

export async function processCommentEvent(change: FeedChange): Promise<void> {
  const val = change.value;
  if (
    change.field === "feed" &&
    val.item === "comment" &&
    val.verb === "add" &&
    val.comment_id &&
    val.message
  ) {
    await replyToComment(
      val.comment_id,
      `Thanks for commenting: "${val.message}"`
    );
  }
}
