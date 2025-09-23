import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../utility/AppError";
import { averageEmbeddings } from "../../utility/image.embedding";
import {
  Logger,
  LogMessage,
  LogPrefix,
  LogService,
} from "../../utility/Logger";
import { sanitizeAndEnrichImages } from "../../utility/sanitizeAndEnrichImages";
import { AIResponse } from "../../utility/summarizer";
import { countWords } from "../../utility/wordCounter";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { IPageInfo, PageInfo } from "./pageInfo.model";
import { IPost, Post } from "./post.mode";

//Product services
const getProducts = async (pageId: string) => {
  const result = await Post.find({ shopId: pageId });
  if (!result.length)
    Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.NOT_FOUND);
  Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.RETRIEVED);
  return result;
};

const getTraindProducts = async (pageId: string) => {
  const result = await Post.find({ shopId: pageId, isTrained: true });
  // console.log("train result",result);
  if (!result.length)
    Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.NOT_FOUND);
  Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.RETRIEVED);
  return result;
};

const getProductById = async (pageId: string, id: string) => {
  const result = await Post.findOne({ shopId: pageId, postId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found");
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.RETRIEVED);
  return result;
};



function sanitizeImages(maybe: any, fallbackFullPicture?: string) {
  if (!Array.isArray(maybe)) maybe = [];
  const images = (maybe as any[])
    .map((img: any) => ({
      url: img?.url ? String(img.url).trim() : "",
      caption: img?.caption ? String(img.caption) : "",
      embedding: Array.isArray(img?.embedding) ? img.embedding : [],
      phash: img?.phash ? String(img.phash) : "",
    }))
    .filter(i => i.url && i.url.length > 0);

  if (images.length === 0 && fallbackFullPicture) {
    images.push({
      url: String(fallbackFullPicture).trim(),
      caption: "",
      embedding: [],
      phash: ""
    });
  }

  return images;
}

const createAndTrainProduct = async (payload: any) => {
  // ensure DB connected
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, "MongoDB not connected");
  }
  if (!payload.shopId || !payload.postId) throw new ApiError(httpStatus.BAD_REQUEST, "Missing shopId or postId");
  const shopId = payload.shopId;
  const postId = payload.postId;
  const findProduct = await Post.findOne({ shopId: payload.shopId, postId: payload.postId }).lean();
  if (findProduct) return "Product Already Created";


  console.log("TRAIN_PRODUCT incoming payload:", JSON.stringify(payload || {}, null, 2));
  // 1. prepare sanitized images (url+caption)
  const images = sanitizeImages(payload?.images || [], payload?.full_picture);

  // 2. If images already have embedding & phash, we can skip compute. Otherwise call enricher.
  const needsEnrichment = images.some(img => !Array.isArray(img.embedding) || img.embedding.length === 0 || !img.phash);

  // get page access token if needed for private cdn
  const page = await PageInfo.findOne({ shopId }).lean().exec();
  const pageToken = page?.accessToken || undefined;

  let enrichedImages = images;
  if (needsEnrichment) {
    try {
      enrichedImages = await sanitizeAndEnrichImages(images, payload?.full_picture, {
        accessToken: pageToken,
        concurrency: 4,
        computeEmbedding: true,
        computePhash: true,
      });
    } catch (e) {
      console.warn("Image enrichment failed (will continue without embeddings):", e);
      // leave enrichedImages as best-effort (may be original sanitized images)
    }
  }

  // 3. aggregated embedding
  const embeddingsList = enrichedImages.map((i: any) => i.embedding).filter((e: any) => Array.isArray(e) && e.length > 0);
  const aggregatedEmbedding = embeddingsList.length ? averageEmbeddings(embeddingsList) : [];

  // 4. upsert (create if not exist)
  const createObj: any = {
    shopId,
    postId,
    message: payload?.message || "",
    summarizedMsg: payload?.summarizedMsg || "",
    full_picture: payload?.full_picture || (enrichedImages[0]?.url || ""),
    images: enrichedImages,
    aggregatedEmbedding,
    isTrained: true,
    createdAt: payload?.createdAt ? new Date(payload.createdAt) : new Date(),
    updatedAt: new Date(),
  };

  // Use findOneAndUpdate with upsert so it's atomic-ish
  const updated = await Post.findOneAndUpdate(
    { shopId, postId },
    { $set: createObj },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, lean: true }
  );

  return updated;
};

const createProduct = async (payload: any) => {
  console.log("CREATE_PRODUCT incoming payload:", JSON.stringify(payload, null, 2));
  if (!payload?.shopId || !payload?.postId) throw new ApiError(httpStatus.BAD_REQUEST, "Missing shopId or postId");
  const findProduct = await Post.findOne({ shopId: payload.shopId, postId: payload.postId }).lean();
  if (findProduct) return "Product Already Created";

  const images = sanitizeImages(payload.images, payload.full_picture);
  // const aggregatedEmbedding=sanitizeEmbedding(payload?.aggregatedEmbedding)
  const aggregatedEmbedding = Array.isArray(payload.aggregatedEmbedding) ? payload.aggregatedEmbedding.map(Number).filter(n => !Number.isNaN(n)) : [];
  const message = payload.message ? String(payload.message) : "";
  let summarizedMsg = payload.summarizedMsg ? String(payload.summarizedMsg) : "";

  if (!summarizedMsg || summarizedMsg.trim().length === 0) {
    if ((message || "").split(/\s+/).filter(Boolean).length > 30) {
      try {
        const short = await AIResponse(message || "", "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens", 50);
        summarizedMsg = String(short || "").trim();
      } catch (e) {
        summarizedMsg = message.slice(0, 300);
      }
    } else summarizedMsg = message.slice(0, 300);
  }

  const createObj: any = {
    shopId: payload.shopId,
    postId: payload.postId,
    message,
    summarizedMsg,
    full_picture: payload.full_picture || (images[0] && images[0].url) || "",
    images,
    aggregatedEmbedding,
    isTrained: true,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
  };

  const result = await Post.create(createObj);
  if (!result) { /* handle error */ }
  return result;
};

const updateProduct = async (
  pageId: string,
  id: string,
  payload: Partial<IPost>
) => {
  const existing = await Post.findOne({ shopId: pageId, postId: id });
  // console.log("update existing", existing);
  if (!existing) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found!");
  }

  let shorterInfo: string | undefined = "";
  if (countWords(payload.message as string) > 30) {
    shorterInfo = await AIResponse(
      payload.message as string,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens",
      50
    );
    payload.summarizedMsg = shorterInfo as string;
  }

  const result = await Post.updateOne({ shopId: pageId, postId: id }, payload, {
    new: true,
    runValidators: true,
  });
  // console.log("update result", result);
  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_UPDATED);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Product Not Updated!"
    );
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.UPDATED);
  return result;
};

const deleteProduct = async (pageId: string, id: string) => {
  const existing = await Post.findOne({ shopId: pageId, postId: id });
  // console.log("remove existing", existing);
  if (!existing) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found!");
  }
  const result = await Post.findOneAndDelete({ shopId: pageId, postId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOTE_DELETED);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Deleted!");
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.DELETED);

  return result;
};

// Shop services
const getShops = async () => {
  const result = await PageInfo.find();
  if (!result.length) {
    Logger(LogService.DB, LogPrefix.SHOPS, LogMessage.NOT_FOUND);
  }
  Logger(LogService.DB, LogPrefix.SHOPS, LogMessage.RETRIEVED);

  return result;
};

const getShopByOwnerAll = async (ownerId: string) => {
  const filter = { ownerId };
  const pages = await PageInfo.find(filter).sort("-createdAt").lean().exec();
  return pages;
};

const getShopById = async (id: string) => {
  const result = await PageInfo.findOne({ shopId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }

  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.RETRIEVED);
  return result;
};

const toggleStatus = async (id: string) => {
  const page = await PageInfo.findById(id);
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, "Page not found");

  page.isStarted = !page.isStarted;
  await page.save();
  return page;
};


const createShop = async (payload: IPageInfo) => {
  const existing = await PageInfo.findOne({ shopId: payload.shopId });
  console.log("payload", payload);
  if (existing) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CONFLICT);
    throw new ApiError(httpStatus.CONFLICT, "Shop Already Exists!");
  }

  const shopInfo = `PageName: ${payload.pageName}, Category: ${payload.pageCategory ?? "N/A"
    }, Address: ${payload?.address ?? "N/A"}
    Phone: ${payload?.phone ? payload.phone : "N/A"}, Email: ${payload?.email ? payload.email : "N/A"
    }, MoreInfo: ${payload?.moreInfo ?? "N/A"}
    `;
  //todo: logic update when user change the info
  let shorterInfo: string | undefined = "";
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 100 tokens",
      100
    );
    payload.summary = shorterInfo as string;
  }

  const result = await PageInfo.create(payload);
  if (!result) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_CREATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not created");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CREATED);

  return result;
};

const updateShop = async (id: string, payload: Partial<IPageInfo>) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }

  const shopInfo = `PageName: ${payload.pageName ? payload.pageName : isExists.pageName
    }, Category: ${payload.pageCategory ? payload.pageCategory : isExists.pageCategory
    }, Address: ${payload.address ? payload.address : isExists.address}
    Phone: ${payload.phone ? payload.phone : isExists.phone}, Email: ${payload.email ? payload.email : isExists.email
    }, MoreInfo: ${payload.moreInfo ? payload.moreInfo : isExists.moreInfo}
    `;

  let shorterInfo: string | undefined = "";
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 100 tokens",
      100
    );
    payload.summary = shorterInfo as string;
  }

  const result = await PageInfo.updateOne({ shopId: id }, payload, {
    new: true,
    runValidators: true,
  });

  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const deleteShop = async (id: string) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.deleteOne({ shopId: id });
  if (!result.deletedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOTE_DELETED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not Deleted");
  }
  return result;
};

const setDmPromt = async (id: string, dmSystemPromt: string) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.updateOne(
    { shopId: id },
    { dmSystemPromt },
    { new: true, runValidators: true }
  );

  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const setCmntPromt = async (id: string, cmntSystemPromt: string) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.updateOne(
    { shopId: id },
    { cmntSystemPromt },
    { new: true, runValidators: true }
  );
  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const getDmMessageCount = async (shopId: string): Promise<number> => {
  if (!shopId) return 0;

  const result = await ChatHistory.aggregate([
    { $match: { shopId } },
    { $unwind: "$messages" },
    { $match: { "messages.role": "assistant" } },
    { $count: "assistantCount" }
  ]);

  return (result.length && result[0].assistantCount) ? result[0].assistantCount : 0;
}

const getCmtMessageCount = async (shopId: string): Promise<number> => {
  if (!shopId) return 0;
  const result = await CommentHistory.aggregate([
    { $match: { shopId } },
    { $unwind: "$messages" },
    { $match: { "messages.role": "assistant" } },
    { $count: "assistantCount" }
  ]);
  return (result.length && result[0].assistantCount) ? result[0].assistantCount : 0;

}

export const PageService = {
  getProducts,
  getTraindProducts,
  getProductById,
  createProduct,
  createAndTrainProduct,
  updateProduct,
  deleteProduct,

  getShops,
  getShopById,
  createShop,
  getShopByOwnerAll,
  toggleStatus,
  updateShop,
  deleteShop,
  setDmPromt,
  setCmntPromt,


  getDmMessageCount,
  getCmtMessageCount
};
