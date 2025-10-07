import { AxiosError } from "axios";
import { fetchPostAttachments } from "../../utility/image.caption";
import { averageEmbeddings, computeHashFromBuffer, createTextEmbedding, downloadImageBuffer, extractImageCaptions, extractImageUrlsFromFeed, extractTextFromImageBuffer } from "../../utility/image.embedding";
import { PageService } from "../Page/page.service";
import { PageInfo } from "../Page/pageInfo.model";


enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

export const handleAddFeed = async (value: any, pageId: string) => {

  try {
    const shop = await PageInfo.findOne({ shopId: pageId });
    if (!shop) {
      console.warn("handleAddFeed: PageInfo not found for", pageId);
      return;
    }
    const pageAccessToken = shop.accessToken || "";
    if (!pageAccessToken) {
      console.warn("handleAddFeed: No page access token for", pageId);
      return;
    }
    const postId = String(value.post_id || value.id || "");
    if (!postId) {
      console.warn("handleAddFeed: no post_id in webhook value", value);
      return;
    }

    // 1) fetch post attachments (to get per-image captions via subattachments)
    let postData: any = null;
    try {
      postData = await fetchPostAttachments(postId, pageAccessToken);
    } catch (err: any) {
      console.warn("fetchPostAttachments failed:", err?.message || err);
    }

    console.log("Post Data: ", postData);

    // 2) extract image captions from Graph response (if available)
    const imagesDescription = postData
      ? await extractImageCaptions(postData)
      : ([] as { photoId?: string; url?: string; caption?: string }[]);
    
    console.log("imagesDescription", imagesDescription);


    // 4) process each image: download, OCR (optional), create embedding
    type ImageResult = {
      url: string;
      photoId?: string | null;
      caption?: string | null;
    };



    // 6) prepare payload & upsert to DB
    const payload: any = {
      postId,
      shopId: pageId,
      message: (postData?.message || value.message || "") as string,
      createdAt: value.created_time
        ? new Date(value.created_time * 1000)
        : new Date(),
      updatedAt: new Date(),
      images: imagesDescription.map((img) => ({
        photoId: img.photoId ? img.photoId : postId.split('_')[1],
        url: img.url,
        caption: img.caption,
      })),
    };

    // Persist: use PageService.createProduct (or adapt to your Post model)
    const result = await PageService.createProduct(payload);

    // if (!result) {
    //   console.warn("handleAddFeed: createProduct returned falsy for", postId);
    // } else {
    //   console.log(
    //     "handleAddFeed: saved post",
    //     postId,
    //     "images:",
    //     payload.images.length
    //   );
    // }
    console.log("Product Created!");
    return "result";
  } catch (err: any) {
    console.error("handleAddFeed: unexpected error:", err?.message || err);
    // Do not throw — webhook should return 200, but you can rethrow if you want failure visibility
    return null;
  }
};