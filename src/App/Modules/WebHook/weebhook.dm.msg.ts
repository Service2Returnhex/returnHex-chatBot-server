import { sendMessage } from "../../api/facebook.api";
import { getAiReplySimple } from "../../utility/aiSimple";
import { downloadToTempFile, readAudioNGenerateText } from "../../utility/voiceToTextConversion";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

export const handleDM = async (
  event: any,
  shopId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  const senderId = event.sender?.id;
  if (!senderId) return;
  if (event.message?.is_echo) return;

  const userMsg = (event.message?.text || "").toString();
  console.log("💬 DM Message:", userMsg);

  if (event.message?.attachments && event.message.attachments.length > 0) {
    const att = event.message.attachments[0];
    if (att.type !== 'image' && att.type === 'audio') {
      const audioUrl = att.payload?.url;
      const tempFilePath = await downloadToTempFile(audioUrl);
      const audioText = await readAudioNGenerateText(tempFilePath);
      console.log('Audio Text:', audioText);
      const aiReply = await getAiReplySimple(method, senderId, shopId, audioText, ActionType.DM, ["chatgpt"]);
      await sendMessage(senderId, shopId, aiReply);
      return;
    }
  }
};



