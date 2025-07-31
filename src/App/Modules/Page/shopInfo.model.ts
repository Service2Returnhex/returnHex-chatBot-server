import mongoose, { Schema, Types } from "mongoose";

export interface IShopInfo {
  pageName: string;
  address: string;
  phone: string;
  pageCategory: string;
  shopId: string; // pageId
  accessToken: string; // subscribe 
  verifyToken: string; //random
}

const ShopInfoSchema = new Schema<IShopInfo>({
  pageName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  pageCategory: { type: String, required: true },
  shopId: { type: String, required: true, unique: true },
  accessToken: { type: String, default: ''},
  verifyToken: { type: String, required: true },
});

export const ShopInfo = mongoose.model<IShopInfo>("ShopInfo", ShopInfoSchema);
