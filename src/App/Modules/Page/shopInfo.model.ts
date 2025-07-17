import mongoose, { Document, Schema } from "mongoose";

export interface IShopInfo extends Document {
    pageName: string;
    address: string;
    phone: string;
    pageCategory: string;
}

const ShopInfoSchema = new Schema<IShopInfo>({
  pageName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  pageCategory: { type: String, required: true },
});


export const ShopInfo = mongoose.model<IShopInfo>("ShopInfo", ShopInfoSchema);