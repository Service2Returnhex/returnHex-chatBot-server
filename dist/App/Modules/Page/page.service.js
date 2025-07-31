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
const Logger_1 = require("../../utility/Logger");
//Product services
const getProducts = (pageId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_mode_1.Product.find({ shopId: pageId });
    if (!result.length)
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCTS, Logger_1.LogMessage.NOT_FOUND);
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCTS, Logger_1.LogMessage.RETRIEVED);
    return result;
});
const getTraindProducts = (pageId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_mode_1.Product.find({ shopId: pageId, isTrained: true });
    if (!result.length)
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCTS, Logger_1.LogMessage.NOT_FOUND);
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCTS, Logger_1.LogMessage.RETRIEVED);
    return result;
});
const getProductById = (pageId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield product_mode_1.Product.findOne({ shopId: pageId, postId: id });
    if (!result) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.NOT_FOUND);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product Not Found");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.RETRIEVED);
    return result;
});
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const findProduct = yield product_mode_1.Product.findOne({ shopId: payload.shopId, postId: payload.postId });
    if (findProduct)
        return "Product Already Created";
    const result = yield product_mode_1.Product.create(Object.assign(Object.assign({}, payload), { isTrained: true }));
    if (!result) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.NOT_CREATED);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Product Not Created!");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.CREATED);
    return result;
});
const updateProduct = (pageId, id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield product_mode_1.Product.findOne({ shopId: pageId, postId: id });
    if (!existing) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.NOT_FOUND);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product Not Found!");
    }
    const result = yield product_mode_1.Product.updateOne({ shopId: pageId, postId: id }, payload, {
        new: true,
        runValidators: true,
    });
    if (!result.modifiedCount) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.NOT_UPDATED);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Product Not Updated!");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.UPDATED);
    return result;
});
const deleteProduct = (pageId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield product_mode_1.Product.findOne({ shopId: pageId, postId: id });
    if (!existing) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.NOT_FOUND);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product Not Found!");
    }
    const result = yield product_mode_1.Product.deleteOne({ shopId: pageId, postId: id });
    if (!result.deletedCount) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.NOTE_DELETED);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product Not Deleted!");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.PRODUCT, Logger_1.LogMessage.DELETED);
    return result;
});
// Shop services
const getShops = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.find();
    if (!result.length) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOPS, Logger_1.LogMessage.NOT_FOUND);
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOPS, Logger_1.LogMessage.RETRIEVED);
    return result;
});
const getShopById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.findOne({ shopId: id });
    if (!result) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.NOT_FOUND);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Shop Not Found");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.RETRIEVED);
    return result;
});
const createShop = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopInfo_model_1.ShopInfo.create(payload);
    if (!result) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.NOT_CREATED);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Shop Not created");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.CREATED);
    return result;
});
const updateShop = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = yield shopInfo_model_1.ShopInfo.findOne({ shopId: id });
    if (!isExists) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.NOT_FOUND);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Shop Not Found");
    }
    const result = yield shopInfo_model_1.ShopInfo.updateOne({ shopId: id }, payload, {
        new: true,
        runValidators: true,
    });
    if (!result.modifiedCount) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.NOT_UPDATED);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Shop Not updated");
    }
    (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.UPDATED);
    return result;
});
const deleteShop = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = yield shopInfo_model_1.ShopInfo.findOne({ shopId: id });
    if (!isExists) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.NOT_FOUND);
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Shop Not Found");
    }
    const result = yield shopInfo_model_1.ShopInfo.deleteOne({ shopId: id });
    if (!result.deletedCount) {
        (0, Logger_1.Logger)(Logger_1.LogService.DB, Logger_1.LogPrefix.SHOP, Logger_1.LogMessage.NOTE_DELETED);
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Shop Not Deleted");
    }
    return result;
});
exports.PageService = {
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
};
