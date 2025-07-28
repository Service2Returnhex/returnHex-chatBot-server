import { CommentHistory } from "../../Chatgpt/comment-histroy.model";
import { PageService } from "../../Page/page.service";

export class FeedService {
  static async handleAddFeed(value: any) {
    const result = await PageService.createProduct({
      postId: value.post_id,
      message: value.message,
      createdAt: value.created_time,
    });
    console.log("post result", result);
    console.log(result ? "Feed Created Successfully" : "Feed Not Created");
  }

  static async handleEditFeed(value: any) {
    const { post_id, message } = value;
    const result = await PageService.updateProduct(post_id, {
      message,
      updatedAt: new Date(),
    });
    console.log(result ? "Feed Updated Successfully" : "Feed Not Updated");
  }

  static async handleRemoveFeed(value: any) {
    const { post_id } = value;
    const result = await PageService.deleteProduct(post_id);
    await CommentHistory.findOneAndDelete({ postId: post_id });
    console.log(result ? "Feed Deleted Successfully" : "Feed Not Deleted");
  }
}
