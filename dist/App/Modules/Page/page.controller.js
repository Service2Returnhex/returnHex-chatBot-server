"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageController = void 0;
const cathcAsync_1 = require("../../utility/cathcAsync");
const sendResponse_1 = __importDefault(require("../../utility/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const page_service_1 = require("./page.service");
//Product controllers
const getProducts = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageId } = req.body;
    const result = yield page_service_1.PageService.getProducts(pageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result
    });
}));
const getTrainedProducts = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pageId } = req.query;
    const result = yield page_service_1.PageService.getProducts(pageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Trained Products retrieved successfully",
        data: result
    });
}));
const getProductById = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { pageId } = req.body;
    const result = yield page_service_1.PageService.getProductById(pageId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "One Product retrieved Successfully",
        data: result
    });
}));
const createProduct = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield page_service_1.PageService.createProduct(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Product created successfully",
        data: result
    });
}));
const updateProduct = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { shopId } = req.body;
    const result = yield page_service_1.PageService.updateProduct(shopId, id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "One Product updated Successfully",
        data: result
    });
}));
const deleteProduct = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { shopId } = req.query;
    const result = yield page_service_1.PageService.deleteProduct(shopId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "One Product deleted Successfully",
        data: result
    });
}));
//Shop Controllers
const getShops = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield page_service_1.PageService.getShops();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Shops retrieved successfully",
        data: result
    });
}));
const getShopById = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield page_service_1.PageService.getShopById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "One Shop retrieved Successfully",
        data: result
    });
}));
const createShop = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield page_service_1.PageService.createShop(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Shop created successfully",
        data: result
    });
}));
const updateShop = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield page_service_1.PageService.updateShop(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "One Shop updated Successfully",
        data: result
    });
}));
const deleteShop = (0, cathcAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield page_service_1.PageService.deleteShop(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "One Shop deleted Successfully",
        data: result
    });
}));
exports.PageController = {
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
};
