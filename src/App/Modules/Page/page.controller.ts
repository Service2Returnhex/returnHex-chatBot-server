import { Request, RequestHandler, Response } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { PageService } from "./page.service";


//Product controllers
const getProducts: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {pageId} = req.body;
    const result = await PageService.getProducts(pageId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result
    })
  }
)


const getTrainedProducts: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {pageId} = req.query;
    const result = await PageService.getProducts(pageId as string);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trained Products retrieved successfully",
      data: result
    })
  }
)

const getProductById: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {id} = req.params
    const {pageId} = req.body
    const result = await PageService.getProductById(pageId, id);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "One Product retrieved Successfully",
      data: result
    })
  }
)

const createProduct: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const result = await PageService.createProduct(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Product created successfully",
      data: result
    })
  }
)

const updateProduct: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {id} = req.params;
    const { shopId } = req.body;
    const result = await PageService.updateProduct(shopId, id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Product updated Successfully",
      data: result
    })
  }
)

const deleteProduct: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {id} = req.params;
    const { shopId } = req.body;
    const result = await PageService.deleteProduct(shopId, id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Product deleted Successfully",
      data: result
    })
  }
)


//Shop Controllers
const getShops: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const result = await PageService.getShops();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Shops retrieved successfully",
      data: result
    })
  }
)

const getShopById: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {id} = req.params
    const result = await PageService.getShopById(id);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "One Shop retrieved Successfully",
      data: result
    })
  }
)

const createShop: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const result = await PageService.createShop(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Shop created successfully",
      data: result
    })
  }
)

const updateShop: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {id} = req.params;
    const result = await PageService.updateShop(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Shop updated Successfully",
      data: result
    })
  }
)

const deleteShop: RequestHandler = catchAsync(
  async(req: Request, res: Response) => {
    const {id} = req.params;
    const result = await PageService.deleteShop(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "One Shop deleted Successfully",
      data: result
    })
  }
)


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
    deleteShop
}