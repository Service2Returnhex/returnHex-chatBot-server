import { replyToComment } from "../../../api/facebook.api";
import { ChatgptService } from "../../Chatgpt/chatgpt.service";
import { CommentHistory } from "../../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../../DeepSeek/deepseek.service";
import { GeminiService } from "../../Gemini/gemini.service";
import { GroqService } from "../../Groq/grok.service";
import { ShopInfo } from "../../Page/shopInfo.model";
import { AIMethod } from "./dm.service";

export class CommentService {
  static async handleAddComment(value: any, method: AIMethod, pageId: string) {
    const { comment_id, message, post_id, from } = value;
    const commenterId = from?.id;
    const userName = from?.name;
    const shop = await ShopInfo.findOne({ pageId });
    if (!shop) return;
    const pageID = shop?.pageId || "";
    if (commenterId === shop?.pageId) return;
    console.log("💬 New Comment:", message);
    // console.log("💬 Comment id:", comment_id);
    // console.log("💬 commenter id:", commenterId);
    // console.log("💬 Comment pageAccessToken:", shop?.pageAccessToken);

    let reply: string;
    switch (method) {
      case "gemini":
        reply = await GeminiService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          pageID,
          "comment"
        );
        break;
      case "chatgpt":
        reply = await ChatgptService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          "comment"
        );
        break;
      case "deepseek":
        reply = await DeepSeekService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          "comment"
        );
        break;
      default:
        reply = await GroqService.getCommnetResponse(
          commenterId,
          comment_id,
          userName || "Customer",
          message,
          post_id,
          "comment"
        );
    }

    await replyToComment(comment_id, reply, shop?.pageAccessToken);
  }

  static async handleEditComment(value: any) {
    const { comment_id, message } = value;
    const result = await CommentHistory.findOneAndUpdate(
      { "messages.commentId": comment_id },
      { $set: { "messages.$.content": message, updatedAt: new Date() } },
      { new: true }
    );
    console.log(
      result ? "Comment Updated Successfully" : "Comment Not Updated"
    );
  }

  static async handleRemoveComment(value: any) {
    const { comment_id } = value;
    const result = await CommentHistory.findOneAndUpdate(
      { "messages.commentId": comment_id },
      {
        $pull: { messages: { commentId: comment_id } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );
    console.log(
      result ? "Comment Deleted Successfully" : "Comment Not Deleted"
    );
  }
}
