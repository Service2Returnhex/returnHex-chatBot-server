import { sendMessage } from "../../api/facebook.api";
import { ActionType, ContentType } from "../../types/file.type";
import { getAiReplySimple } from "../../utility/aiSimple";
import { convertImageToText, downloadToTempFile, readAudioNGenerateText } from "../../utility/attachementsToTextConversion";



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

  const attachhementlength = event.message?.attachments?.length || 0;
  if (event.message?.attachments && attachhementlength > 0) {
    const att = event.message.attachments[0];
    
    if (att.type === 'audio') {
      console.log('Audio Attachemet Detected:');
      const audioUrl = att.payload?.url;
      const tempFilePath = await downloadToTempFile(audioUrl);
      const audioText = await readAudioNGenerateText(tempFilePath);
      console.log('Audio Text:', audioText);
      const aiReply = await getAiReplySimple(
        method, 
        senderId, 
        shopId, 
        audioText, 
        ActionType.DM, ["chatgpt"]
      );
      await sendMessage(
        senderId, 
        shopId, 
        aiReply, 
        ContentType.AUDIO
      );
      return;
    }

    if (att.type === 'image') {
      console.log('Image Attachemets Detected:');
      
      const imageUrls: string[] = event.message.attachments
        .map((att: any) => att.payload?.url)
        .filter((url: string): url is string => !!url)
      console.log("Image Urls: ", imageUrls); 
      const imageTexts = await convertImageToText(imageUrls)
      let combinedText = '';
      imageTexts.forEach((text, idx) => {
        combinedText += `image-${idx}: ${text}\n`;
      })
      console.log(combinedText);
      const aiReply = await getAiReplySimple(
        method, 
        senderId, 
        shopId, 
        combinedText, 
        ActionType.DM, ["chatgpt"]
      );
      await sendMessage(
        senderId, 
        shopId, 
        aiReply, 
        ContentType.IMAGE
      );
      return;
    }

    if ( att.type === 'video') {
      console.log('Video Attachemets Detected:');
      await sendMessage(
        senderId, 
        shopId, 
        "Video Support is not available. Only text, image and voice support available", 
        ContentType.VIDEO
      );
      return;
    }

    if (att.type === 'file') {
      console.log('File Attachemets Detected:');
      await sendMessage(
        senderId, 
        shopId, 
        "File(pdf, docs etc.) Support is not available. Only text, image and voice support available", 
        ContentType.FILE
      );
      return;
    }

    if (att.type === 'location') {
      console.log('Location Attachemets Detected:');
      await sendMessage(
        senderId, 
        shopId, 
        "Location Support is not available. Only text, image and voice support available", 
        ContentType.LOCATION
      );
      return;
    }

    if (att.type === 'fallback') {
      console.log('Fallback Attachemets Detected:');
      await sendMessage(
        senderId, 
        shopId, 
        "Links Support is not available. Only text, image and voice support available", 
        ContentType.FALLBACK
      );
      return;
    }

    console.log('Unknown Attachemets Detected:', att.type);
    return;
  }

  // Plain Text Message
  let aiReply = await getAiReplySimple(method, senderId, shopId, userMsg, ActionType.DM, ["chatgpt"]);
  if (!aiReply) {
    aiReply = "Something went wrong!! Ask Again";
  }

  console.log("AI Reply:", aiReply);
  await sendMessage(senderId, shopId, aiReply, ContentType.TEXT);
  console.log("Reply sent to user.");
  return;
};



