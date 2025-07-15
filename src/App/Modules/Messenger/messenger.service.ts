import { generateGeminiReply } from "../../utility/gemini";
import { callSendAPI } from "../../utility/messenger";

export async function processMessageEvent(event: any) {
  const sender = event.sender.id;
  const msg = event.message.text;
  const reply = await generateGeminiReply(msg);
  await callSendAPI(sender, reply);
}
