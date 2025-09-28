import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { PageService } from "./page.service";
import { getMessageCountUsageByShop } from "./pageCountMsg";

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

const createProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PageService.createAndTrainProduct(req.body);
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

const toggleStatus: RequestHandler = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PageService.toggleStatus(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Page status updated successfully",
    data: result,
  });
});

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

const getPagesByOwner: RequestHandler = catchAsync(
  async (req, res) => {
    const ownerId = req.params.ownerId;
    console.log("ownerid back", ownerId);
    if (!ownerId) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "ownerId is required",
        data: null,
      });
    }

    const result = await PageService.getShopByOwnerAll(ownerId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Pages fetched successfully",
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

const trainProductHandler: RequestHandler = catchAsync(async (req: Request, res: Response) => {
  // postId will come from route param (similar to setCmntPromt)
  console.log("req params", req.params);
  console.log("req body", req.body);
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
  // console.log("Calling PageService.trainProduct with", { shopId, postId });
  const fullPostPayload = req.body as any;
  try {
    const trained = await PageService.createAndTrainProduct(req.body);
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

const getDmMessageCount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const shopId = (req.params.shopId as string) || (req.query.shopId as string);

    if (!shopId) {
      res.status(400).json({ success: false, message: "shopId is required" });
      return;
    }

    const count = await PageService.getDmMessageCount(shopId);
    res.json({ success: true, shopId, count });
  }
)

const getCmtMessageCount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const shopId = (req.params.shopId as string) || (req.query.shopId as string);
    if (!shopId) {
      res.status(400).json({ success: false, message: "shopId is required" });
      return;
    }

    const count = await PageService.getCmtMessageCount(shopId);
    res.json({ success: true, shopId, count });
  }
)

const getUsageByShop: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const shopId = (req.params.shopId as string) || (req.query.shopId as string);

    if (!shopId) {
      res.status(400).json({ success: false, message: "shopId is required" });
      return
    }

    const range = (req.query.range as "daily" | "weekly" | "month-week") || "daily";
    const days = Number(req.query.days ?? 7);
    const weeks = Number(req.query.weeks ?? 6);
    const totalTokensAvailable = Number(req.query.totalTokensAvailable ?? 1000);

    const result = await getMessageCountUsageByShop(shopId, range, {
      days,
      weeks,
      totalTokensAvailable
    });

    // if (range === "daily") {
    //   return res.json({ success: true, points: result.points });
    // }

    res.json({ success: true, data: result });
    return
  }
);

const getMsgCounts = catchAsync(
  async (req: Request, res: Response) => {
    const shopId = (req.params.shopId as string) || (req.query.shopId as string);
    if (!shopId) {
      res.status(400).json({ success: false, message: "shopId required" });
      return;
    }

    // run both in parallel
    const [msgCount, cmtCount] = await Promise.all([
      PageService.getDmMessageCount(shopId),
      PageService.getCmtMessageCount(shopId),
    ]);

    const total = (msgCount ?? 0) + (cmtCount ?? 0);
    const totalTokensAvailable = Number(req.query.totalTokensAvailable ?? 1000) - total;

    res.json({
      success: true,
      data: { msgCount, cmtCount, total, totalTokensAvailable }
    });
    return
  });


const getOrders: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { shopId } = req.params; 
    const result = await PageService.getOrders(shopId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Order retrieved successfully",
      data: result,
    });
  }
);

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
  getPagesByOwner,
  toggleStatus,
  updateShop,
  deleteShop,
  setDmPromt,
  setCmntPromt,

  getOrders,

  trainProductHandler,
  getDmMessageCount,
  getCmtMessageCount,
  getUsageByShop,
  getMsgCounts
};
