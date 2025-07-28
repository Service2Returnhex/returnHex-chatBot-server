import { CommentService } from "./services/comment.service";
import { AIMethod, DMService } from "./services/dm.service";
import { FeedService } from "./services/feed.service";

export class WebHookService {
  static async handleIncomingMessages(
    payload: any,
    pageAccessToken: string,
    pageId:string,
    method: AIMethod
  ): Promise<string> {
    if (payload.object !== "page") return "Not a page event";

    for (const entry of payload.entry) {
      // DMs
      for (const evt of entry.messaging || []) {
        if (evt.message?.text && !evt.message.is_echo) {
          await DMService.handleDM(evt, method, pageAccessToken);
          break; // one DM per entry
        }
      }

      // Feed & Comments
      for (const change of entry.changes || []) {
        const { field, value } = change;
        if (field !== "feed") continue;

        if (["post", "photo", "video", "status"].includes(value.item)) {
          if (value.verb === "add") await FeedService.handleAddFeed(value);
          if (value.verb === "edited") await FeedService.handleEditFeed(value);
          if (value.verb === "remove")
            await FeedService.handleRemoveFeed(value);
        } else if (value.item === "comment") {
          if (value.verb === "add")
            await CommentService.handleAddComment(value, method,pageId);
          if (value.verb === "edited")
            await CommentService.handleEditComment(value);
          if (value.verb === "remove")
            await CommentService.handleRemoveComment(value);
        }
      }
    }
    return "Processed";
  }
}
