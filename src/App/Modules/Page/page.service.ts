import httpStatus from "http-status";
import ApiError from "../../utility/AppError";
import {
  Logger,
  LogMessage,
  LogPrefix,
  LogService,
} from "../../utility/Logger";
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
  if(existing) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CONFLICT);
    throw new ApiError(httpStatus.CONFLICT, "Shop Already Exists!");
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

const setDmPromt = async (id: string,  dmSystemPromt: string ) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.updateOne(
    { shopId: id },
    { dmSystemPromt},
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
    { cmntSystemPromt},
    { new: true, runValidators: true }
  );
  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const getDmMessageCount=async(shopId:string ):Promise<number>=>{
    if (!shopId) return 0;

      const result = await ChatHistory.aggregate([
    { $match: { shopId } },                          // filter by shop
    { $unwind: "$messages" },                        // flatten messages array
    { $match: { "messages.role": "assistant" } },    // only assistant messages
    { $count: "assistantCount" }                     // returns [{ assistantCount: N }] or []
  ]);

  return (result.length && result[0].assistantCount) ? result[0].assistantCount : 0;
}

const getCmtMessageCount=async(shopId:string):Promise<number>=>{
if (!shopId)return 0;
const result=await CommentHistory.aggregate([
  {$match:{shopId}},
  {$unwind:"$messages"},
  { $match: { "messages.role": "assistant" } },
  {$count:"assistantCount"}
]);
return (result.length && result[0].assistantCount)?result[0].assistantCount:0;

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
  updateShop,
  deleteShop,
  setDmPromt,
  setCmntPromt,

  getDmMessageCount,
  getCmtMessageCount
};
