import ApiError from "../../utility/AppError";
import { IProduct, Product } from "./product.mode";
import httpStatus from "http-status";
import { ShopInfo } from "./shopInfo.model";

//Product services
const getProducts = async () => {
  const result = await Product.find();
  return result;
};

const getProductById = async (id: string) => {
  const result = await Product.findOne({postId: id});
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found");
  return result;
};

const createProduct = async (payload: IProduct) => {
    const result = await Product.create(payload);
    return result;
}

const updateProduct = async (pageId: string, id: string, payload: Partial<IProduct>) => {

  const existing = await Product.findOne({ shopId: pageId, postId: id });
  if (!existing) {
    console.log("Product already deleted or not found for postId:", id);
    return null;
  }

  const result = await Product.findOneAndUpdate({postId: id}, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProduct = async (pageId: string, id: string) => {
  const existing = await Product.findOne({ shopId: pageId, postId: id });
  if (!existing) {
    console.log("Product already deleted or not found for postId:", id);
    return null;
  }
  const result = await Product.findOneAndDelete({ postId: id });
  return result;
};

// Shop services
const getShops = async () => {
  const result = await ShopInfo.find()
  return result;
};

const getShopById = async (id: string) => {
  const result = await ShopInfo.findById(id);
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  return result;
};

const createShop = async (payload: any) => {
  const result = await ShopInfo.create(payload);
  return result;
};

const updateShop = async (id: string, payload: any) => {
  const result = await ShopInfo.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  return result;
};

const deleteShop = async (id: string) => {
  const result = await ShopInfo.findByIdAndDelete(id);
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  return result;
};

export const PageService = {
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
}