import httpStatus from "http-status";
import ApiError from "../../utility/AppError";
import {
  Logger,
  LogMessage,
  LogPrefix,
  LogService,
} from "../../utility/Logger";
import { IPageInfo, PageInfo } from "./pageInfo.model";
import { IPost, Post } from "./post.mode";
import { AIResponse } from "../../utility/summarizer";
import { countWords } from "../../utility/wordCounter";

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

const createProduct = async (payload: IPost) => {
  const findProduct = await Post.findOne({
    shopId: payload.shopId,
    postId: payload.postId,
  });
  if (findProduct) return "Product Already Created";
  let shorterInfo: string | undefined = "";
  if (countWords(payload.message) > 30) {
    shorterInfo = await AIResponse(
      payload.message,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 45 tokens",
      50
    );
    payload.summarizedMsg = shorterInfo as string;
  }
  const result = await Post.create({ ...payload, isTrained: true });
  if (!result) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_CREATED);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Product Not Created!"
    );
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.CREATED);

  return result;
};

const updateProduct = async (
  pageId: string,
  id: string,
  payload: Partial<IPost>
) => {
  const existing = await Post.findOne({ shopId: pageId, postId: id });
  if (!existing) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found!");
  }

  let shorterInfo: string | undefined = "";
  if (countWords(payload.message as string) > 30) {
    shorterInfo = await AIResponse(
      payload.message as string,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 45 tokens",
      50
    );
    payload.summarizedMsg = shorterInfo as string;
  }

  const result = await Post.updateOne({ shopId: pageId, postId: id }, payload, {
    new: true,
    runValidators: true,
  });

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
  const result = await Post.deleteOne({ shopId: pageId, postId: id });
  if (!result.deletedCount) {
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

const getShopById = async (id: string) => {
  const result = await PageInfo.findOne({ shopId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }

  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.RETRIEVED);
  return result;
};

const createShop = async (payload: IPageInfo) => {
  const existing = await PageInfo.findOne({ shopId: payload.shopId });
  if (existing) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CONFLICT);
    throw new ApiError(httpStatus.CONFLICT, "Shop Already Exists!");
  }

  const shopInfo = `PageName: ${payload.pageName}, Category: ${
    payload.pageCategory ?? "N/A"
  }, Address: ${payload?.address ?? "N/A"}
    Phone: ${payload?.phone ? payload.phone : "N/A"}, Email: ${
    payload?.email ? payload.email : "N/A"
  }, MoreInfo: ${payload?.moreInfo ?? "N/A"}
    `;
  //todo: logic update when user change the info
  let shorterInfo: string | undefined = "";
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 70 tokens",
      70
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

  const shopInfo = `PageName: ${
    payload.pageName ? payload.pageName : isExists.pageName
  }, Category: ${
    payload.pageCategory ? payload.pageCategory : isExists.pageCategory
  }, Address: ${payload.address ? payload.address : isExists.address}
    Phone: ${payload.phone ? payload.phone : isExists.phone}, Email: ${
    payload.email ? payload.email : isExists.email
  }, MoreInfo: ${payload.moreInfo ? payload.moreInfo : isExists.moreInfo}
    `;

  let shorterInfo: string | undefined = "";
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 45 tokens",
      50
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
  updateShop,
  deleteShop,
  setDmPromt,
  setCmntPromt,
};
