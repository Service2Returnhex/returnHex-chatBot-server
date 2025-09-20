import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { PageService } from "./page.service";

//Product controllers
const getProducts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { pageId } = req.query;
    const result = await PageService.getProducts(pageId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  }
);

const getTrainedProducts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { pageId } = req.query;
    const result = await PageService.getProducts(pageId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trained Products retrieved successfully",
      data: result,
    });
  }
);

const getProductById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { pageId } = req.body;
    const result = await PageService.getProductById(pageId, id);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "One Product retrieved Successfully",
      data: result,
    });
  }
);

const createProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PageService.createProduct(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Product created successfully",
      data: result,
    });
  }
);

const updateProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { shopId } = req.body;
    const result = await PageService.updateProduct(shopId, id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Product updated Successfully",
      data: result,
    });
  }
);

const deleteProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { shopId } = req.query;
    const result = await PageService.deleteProduct(shopId as string, id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Product deleted Successfully",
      data: result,
    });
  }
);

//Shop Controllers
const getShops: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PageService.getShops();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Shops retrieved successfully",
      data: result,
    });
  }
);

const getShopById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PageService.getShopById(id);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "One Shop retrieved Successfully",
      data: result,
    });
  }
);

const createShop: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PageService.createShop(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Shop created successfully",
      data: result,
    });
  }
);

const updateShop: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PageService.updateShop(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Shop updated Successfully",
      data: result,
    });
  }
);

const deleteShop: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PageService.deleteShop(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Shop deleted Successfully",
      data: result,
    });
  }
);

const setDmPromt: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dmSystemPromt } = req.body;
    console.log(dmSystemPromt);
    const result = await PageService.setDmPromt(id, dmSystemPromt);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "DM System Prompt updated Successfully",
      data: result,
    });
  }
);

const setCmntPromt: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cmntSystemPromt } = req.body;
    const result = await PageService.setCmntPromt(id, cmntSystemPromt);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Comment System Prompt updated Successfully",
      data: result,
    });
  }
);
const trainProductHandler :RequestHandler = catchAsync(async (req: Request, res: Response) => {
  // postId will come from route param (similar to setCmntPromt)
  console.log("req params",req.params);
  console.log("req body",req.body);
const postId = String(req.params.postId || req.params.id || "");
  // shopId should be passed in body or query
  const shopId = String(req.body?.shopId || req.query.shopId || "");

if (!shopId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Missing shopId in request body or query",
      data: null,
    });
  }

  if (!postId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Missing postId (route param)",
      data: null,
    });
  }
console.log("Calling PageService.trainProduct with", { shopId, postId });
const fullPostPayload = req.body as any;
 try {
    const trained = await PageService.trainProduct(shopId, postId,fullPostPayload);
    console.log("trained result", trained);
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Post trained successfully",
      data: trained,
    });
  } catch (err: any) {
    console.error("PageService.trainProduct threw:", err);
    // return error to client
    return sendResponse(res, {
      statusCode: err?.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: err?.message || "Training failed",
      data: null,
    });
  }
});
// console.log("trainProductHandler",trainProductHandler);

//  const trainProductHandler = async (req: Request, res: Response) => {
//   try {
//     const postId = req.params.postId;
//     const shopId = req.body.shopId || req.query.shopId;
//     if (!shopId || !postId) return res.status(400).json({ success: false, message: "Missing shopId or postId" });

//     // find the existing post (must exist)
//     const existing = await Post.findOne({ shopId, postId }).lean();
//     if (!existing) return res.status(404).json({ success: false, message: "Post not found" });

//     // Prefer images from DB (if user previously trained they might exist), else use existing.full_picture
//     const incomingImages = Array.isArray(existing.images) && existing.images.length ? existing.images : [];

//     // sanitize & enrich: compute phash & embedding for any images missing them
//     const enrichedImages = await sanitizeAndEnrichImages(incomingImages, existing.full_picture || undefined, {
//       accessToken: undefined, // if your downloadImageBuffer needs token, provide it
//       concurrency: 4,
//       computeEmbedding: true,
//       computePhash: true,
//     });

//     // compute aggregated embedding (average)
//     const embeddingsList = enrichedImages.map((i: any) => i.embedding).filter((e: any) => Array.isArray(e) && e.length > 0);
//     const aggregatedEmbedding = embeddingsList.length ? averageEmbeddings(embeddingsList) : [];

//     // update the Post document
//     const updateObj: any = {
//       images: enrichedImages,
//       aggregatedEmbedding,
//       isTrained: true,
//       updatedAt: new Date(),
//     };

//     const updateRes = await Post.updateOne({ shopId, postId }, { $set: updateObj }, { runValidators: true });
//     if (!updateRes.matchedCount) {
//       return res.status(500).json({ success: false, message: "Failed to update post after training" });
//     }

//     const updatedDoc = await Post.findOne({ shopId, postId }).lean();
//     return res.json({ success: true, message: "Trained successfully", data: updatedDoc });
//   } catch (err: any) {
//     console.error("trainProductHandler error:", err);
//     return res.status(500).json({ success: false, message: "Training failed", error: err?.message });
//   }
// };

export const PageController = {
  getProducts,
  getTrainedProducts,
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

  trainProductHandler
};
