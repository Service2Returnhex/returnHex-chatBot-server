import { AxiosError } from "axios";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { sendMessage } from "../../api/facebook.api";
import ApiError from "../../utility/AppError";
import { averageEmbeddings, computeHashFromBuffer, createTextEmbedding, downloadImageBuffer, extractImageCaptions, extractImageUrlsFromTrainPost, extractTextFromImageBuffer } from "../../utility/image.embedding";
import {
  Logger,
  LogMessage,
  LogPrefix,
  LogService,
} from "../../utility/Logger";
import { buildOrderStatusMessage } from "../../utility/orderStatusMessage";
import { AIResponse, TtokenUsage } from "../../utility/summarizer";
import { countWords } from "../../utility/wordCounter";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { Order } from "./order.model";
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

function sanitizeImages(payload: IPost, maybe: any, fallbackFullPicture?: string) {
  if (!Array.isArray(maybe)) maybe = [];
  const images = (maybe as any[])
    .map((img: any) => ({
      photoId: img?.photoId ? String(img.photoId).trim() : "",
      url: img?.url ? String(img.url).trim() : "",
      caption: img?.caption ? String(img.caption) : "",
    }))
    .filter((i) => i.url && i.url.length > 0);

  if (images.length === 0 && fallbackFullPicture) {
    images.push({
      photoId: payload.postId.split('_')[1],
      url: String(fallbackFullPicture).trim(),
      caption: "",
    });
  }
  return images;
}

const createProduct = async (payload: IPost) => {

  if (!payload?.shopId || !payload?.postId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing shopId or postId");
  const findProduct = await Post.findOne({
    shopId: payload.shopId,
    postId: payload.postId,
  }).lean();
  if (findProduct) return "Product Already Created";

  const images = sanitizeImages(payload, payload.images, payload.full_picture);

  let imagesCaptions = ''
  images.forEach((img, idx) => {
    imagesCaptions += `Image-${idx}: ${img.caption}, `
  })
 
  let message = payload.message ? String(payload.message) : "";
  const fullTextsOfImages = message + "\n" + imagesCaptions


  let shorterInfo: {
    response: string | undefined;
    tokenUsage: TtokenUsage;
  };

  const words = countWords(fullTextsOfImages as string);
  console.log("Words: ", words);

  if (countWords(fullTextsOfImages as string) > 30) {
    shorterInfo = await AIResponse(
      fullTextsOfImages as string,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens",
      50
    );
    payload.summarizedMsg = shorterInfo.response;

    await PageInfo.updateOne(
      { shopId: payload.shopId },
      {
        $inc: {
          "tokenUsage.inputToken": shorterInfo.tokenUsage.inputToken,
          "tokenUsage.outputToken": shorterInfo.tokenUsage.outputToken,
          "tokenUsage.totalToken": shorterInfo.tokenUsage.totalToken,
        },
      },
    );
  } else message = fullTextsOfImages;

  const createObj: any = {
    shopId: payload.shopId,
    postId: payload.postId,
    message,
    summarizedMsg: payload.summarizedMsg,
    full_picture: payload.full_picture || (images[0] && images[0].url) || "",
    images,
    isTrained: true,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
  };

  const result = await Post.create(createObj);
  return result;
};

const updateProduct = async (
  payload: IPost
) => {
  if (!payload?.shopId || !payload?.postId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing shopId or postId");
  const existing = await Post.findOne({
    shopId: payload.shopId,
    postId: payload.postId,
  }).lean();

  if (!existing) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found!");
  }

  const images = sanitizeImages(payload, payload.images, payload.full_picture);
  const message = payload.message ? String(payload.message) : "";
  let summarizedMsg = payload.summarizedMsg
    ? String(payload.summarizedMsg)
    : "";

  if (!summarizedMsg || summarizedMsg.trim().length === 0) {
    if ((message || "").split(/\s+/).filter(Boolean).length > 30) {
      try {
        const short = await AIResponse(
          // payload?.shopId,
          message || "",
          "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens",
          50
        );
        summarizedMsg = String(short || "").trim();
      } catch (e) {
        summarizedMsg = message.slice(0, 300);
      }
    } else summarizedMsg = message.slice(0, 300);
  }

  const updateObj: any = {
    shopId: payload.shopId,
    postId: payload.postId,
    message,
    summarizedMsg,
    full_picture: payload.full_picture || (images[0] && images[0].url) || "",
    images,
    isTrained: true,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
  };


  let shorterInfo: {
    response: string | undefined;
    tokenUsage: TtokenUsage;
  };
  if (countWords(payload.message as string) > 30) {
    shorterInfo = await AIResponse(
      payload.message as string,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens",
      50
    );
    payload.summarizedMsg = shorterInfo.response;

    await PageInfo.updateOne(
      { shopId: payload.shopId },
      {
        $inc: {
          "tokenUsage.inputToken": shorterInfo.tokenUsage.inputToken,
          "tokenUsage.outputToken": shorterInfo.tokenUsage.outputToken,
          "tokenUsage.totalToken": shorterInfo.tokenUsage.totalToken,
        },
      },
    );
  }

  const result = await Post.updateOne({ shopId: payload.shopId, postId: payload.postId }, updateObj, {
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

const togglePageStatus = async (id: string) => {
  const page = await PageInfo.findById(id);
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, "Page not found");
  page.isStarted = !page.isStarted;
  await page.save();
  return page;
};

const createShop = async (payload: IPageInfo) => {
  const existing = await PageInfo.findOne({ shopId: payload.shopId });
  if (existing) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CONFLICT);
    throw new ApiError(httpStatus.CONFLICT, "Shop Already Exists!");
  }

  const shopInfo = `PageName: ${payload.pageName ? payload.pageName : "N/A"}, Category: ${payload.pageCategory ? payload.pageCategory : "N/A"
    }, Address: ${payload?.address ? payload?.address : "N/A"}
  Phone: ${payload?.phone ? payload.phone : "N/A"}, Email: ${payload?.email ? payload.email : "N/A"
    }, MoreInfo: ${payload?.moreInfo ? payload?.moreInfo : "N/A"}
  `;

  let shorterInfo: {
    response: string | undefined;
    tokenUsage: TtokenUsage;
  };
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 100 tokens",
      90
    );
    payload.summary = shorterInfo.response as string;
    payload.tokenUsage = {
      inputToken: shorterInfo.tokenUsage.inputToken,
      outputToken: shorterInfo.tokenUsage.outputToken,
      totalToken: shorterInfo.tokenUsage.totalToken,
    }
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
  console.log("shop id", id);
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

  let shorterInfo: {
    response: string | undefined;
    tokenUsage: TtokenUsage;
  } = {
    response: "",
    tokenUsage: {
      inputToken: 0,
      outputToken: 0,
      totalToken: 0,
    },
  };

  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 100 tokens",
      100
    );
    payload.summary = shorterInfo.response as string;
  }

  const result = await PageInfo.updateOne({ shopId: id },
    {
      $set: payload,
      $inc: {
        "tokenUsage.inputToken": shorterInfo.tokenUsage.inputToken,
        "tokenUsage.outputToken": shorterInfo.tokenUsage.outputToken,
        "tokenUsage.totalToken": shorterInfo.tokenUsage.totalToken,
      }
    }
    , {
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
    { runValidators: true }
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
    { runValidators: true }
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
    { $count: "assistantCount" },
  ]);

  return result.length && result[0].assistantCount
    ? result[0].assistantCount
    : 0;
};

const getCmtMessageCount = async (shopId: string): Promise<number> => {
  if (!shopId) return 0;
  const result = await CommentHistory.aggregate([
    { $match: { shopId } },
    { $unwind: "$messages" },
    { $match: { "messages.role": "assistant" } },
    { $count: "assistantCount" },
  ]);
  return result.length && result[0].assistantCount
    ? result[0].assistantCount
    : 0;
};

const getOrders = async (pageId: string) => {
  const result = await Order.find({ shopId: pageId });
  console.log(result);
  if (!result.length)
    Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.NOT_FOUND);
  Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.RETRIEVED);
  return result;
};

const updateOrderStatus = async (id: string, newStatus: "pending" | "confirmed" | "delivered" | "cancelled") => {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");

  order.status = newStatus; // directly set new status
  await order.save();
  return order;
};


const followUpDmMsg = async (orderId: string, newStatus: "pending" | "confirmed" | "delivered" | "cancelled") => {
  // 1. fetch order
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");

  // 2. update status
  order.status = newStatus;
  await order.save();
  console.log("order", order);

  // 3. try notify customer (fire-and-forget style but awaited in try/catch so we can log failures)
  (async () => {
    try {
      // find page token by shopId
      const page = await PageInfo.findOne({ shopId: order.shopId }).lean().exec();
      const pageToken = page?.accessToken ?? null;
      const psid = order.userId; // your stored senderId / PSID

      if (!pageToken || !psid) return;

      // build message text (customize as you like)
      const text = buildOrderStatusMessage(order, newStatus);

      // send
      await sendMessage(psid, order?.shopId, text);
    } catch (err) {
      // do not fail the status update if notification fails; just log
      console.warn("Failed to send order status notification:", err);
    }
  })();

  return order;
}



export const PageService = {
  getProducts,
  getTraindProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  getShops,
  getShopById,
  createShop,
  getShopByOwnerAll,
  togglePageStatus,
  updateShop,
  deleteShop,
  setDmPromt,
  setCmntPromt,

  getOrders,
  updateOrderStatus,
  followUpDmMsg,

  getDmMessageCount,
  getCmtMessageCount,
};
