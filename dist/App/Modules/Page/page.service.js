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
exports.PageService = void 0;
const AppError_1 = __importDefault(require("../../utility/AppError"));
const product_mode_1 = require("./product.mode");
const http_status_1 = __importDefault(require("http-status"));
const shopInfo_model_1 = require("./shopInfo.model");
//Product services
const getProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_mode_1.Product.find();
    return result;
});
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_mode_1.Product.findOne({ postId: id });
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product Not Found");
    return result;
});
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_mode_1.Product.create(payload);
    return result;
});
const updateProduct = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield product_mode_1.Product.findOne({ postId: id });
    if (!existing) {
        console.log("Product already deleted or not found for postId:", id);
        return null;
    }
    const result = yield product_mode_1.Product.findOneAndUpdate({ postId: id }, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield product_mode_1.Product.findOne({ postId: id });
    if (!existing) {
        console.log("Product already deleted or not found for postId:", id);
        return null;
    }
    const result = yield product_mode_1.Product.findOneAndDelete({ postId: id });
    return result;
});
// Shop services
const getShops = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.find();
    return result;
});
const getShopById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.findById(id);
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Shop Not Found");
    return result;
});
const createShop = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.create(payload);
    return result;
});
const updateShop = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Shop Not Found");
    return result;
});
const deleteShop = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.findByIdAndDelete(id);
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Shop Not Found");
    return result;
});
exports.PageService = {
    getProducts,
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
