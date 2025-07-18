import { Request, Response } from "express";
import { GeminiService } from "../Gemini/gemini.service";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { PageService } from "../Page/page.service";
import { ChatHistory } from "../Chatgpt/chat-history.model";

// enum ActionType {
//   MSG_REPLY = "reply",
//   COMMENT_REPLAY = "comment",
// }

const handleAddFeed = async (value: any) => {
  const result = await PageService.createProduct({
    postId: value.post_id,
    message: value.message,
    createdAt: value.created_time,
  });

  !result
    ? console.log("Feed Not Created")
    : console.log("Feed Created Successfully");
};

const handleEditFeed = async (value: any) => {
  const { post_id, message } = value;
  const result = await PageService.updateProduct(post_id, {
    message,
    updatedAt: new Date(),
  });

  !result
    ? console.log("Feed Not Updated")
    : console.log("Feed Updated Successfully");
};

const handleRemoveFeed = async (value: any) => {
  const { post_id } = value;
  const result = await PageService.deleteProduct(post_id);

  !result
    ? console.log("Feed Not Deleted")
    : console.log("Feed Deleted Successfully");
};

// Photo - A photo uploaded to the Page.
const handleAddPhoto = async (value: any) => {
  const { post_id, message, created_time } = value;
  const result = await PageService.createProduct({
    postId: post_id,
    message,
    createdAt: created_time,
  });

  !result
    ? console.log("Photo Not Created")
    : console.log("Photo Created Successfully");
};

const handleEditPhoto = async(value: any) => {

};

const handleRemovePhoto = (photoId: string) => {
  // ...
};

// Video - A video uploaded to the Page.
const handleAddVideo = (videoUrl: string, title?: string) => {
  // ...
};

const handleEditVideo = (videoId: string, newTitle: string) => {
  // ...
};

const handleRemoveVideo = (videoId: string) => {
  // ...
};

// Comment - A comment on a post or photo.
const handleAddComment = async (value: any, method: string) => {
  const { comment_id, message, post_id, from } = value;
        const commenterId = from?.id;

        // Skip your own bot comments
        if (commenterId === "708889365641067") {
          console.log("⛔ Skipping own comment to avoid infinite loop.");
          return;
        }

        console.log("💬 New Comment:", message);

        const reply =
          method === "gemini"
            ? await GeminiService.getResponse(commenterId, message)
            : await ChatgptService.getResponse(commenterId, message, post_id);

        await (method === "gemini"
          ? GeminiService.replyToComment(comment_id, reply as string)
          : ChatgptService.replyToComment(comment_id, reply as string));
};

const handleEditComment = async (value: any) => {
  const { comment_id, message } = value;
  const result = await ChatHistory.findOneAndUpdate(

  !result
    ? console.log("Comment Not Updated")
    : console.log("Comment Updated Successfully");
};

const handleRemoveComment = (commentId: string) => {
  // ...
};

const handleIncomingMessages = async (
  req: Request,
  res: Response,
  method: "gemini" | "chatgpt"
) => {
  if (req.body.object !== "page") {
    return "Reply Not Bot Working";
  }

  for (const entry of req.body.entry) {
    const event = entry.messaging?.[0];

    // Handle Direct Messages
    if (event?.message) {
      const senderId = event.sender.id;
      const userMsg = event.message.text;
      console.log("💬 DM Message:", userMsg);

      const reply =
        method === "gemini"
          ? await GeminiService.getResponse(senderId, userMsg)
          : await ChatgptService.getResponse(senderId, userMsg);

      await (method === "gemini"
        ? GeminiService.sendMessage(senderId, reply as string)
        : ChatgptService.sendMessage(senderId, reply as string));
    }

    // Handle Feed Events
    const changes = entry.changes || [];
    for (const change of changes) {
      const { field, value } = change;
      console.log("📦 Feed Change:", JSON.stringify(change, null, 2));

      // ✅ Handle Feed Post Events
      if (field === "feed" && 
        ['post', 'photo', 'video', 'status'].includes(value.item)
      ) {
        if (value.verb === "add") {
          handleAddFeed(value);
        } else if (value.verb === "edited") {
          handleEditFeed(value);
        } else if (value.verb === "remove") {
          handleRemoveFeed(value);
        }
      }
       

      // ✅ Handle Comments
      if (
        field === "feed" &&
        value.item === "comment"
      ) {
        if (value.verb === "add") {
          handleAddComment(value, method);
        }
      }
    }
  }

  return "Reply Bot Working";
};

export const WebHookService = {
  handleIncomingMessages,
};
