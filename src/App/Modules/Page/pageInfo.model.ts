import mongoose, { Schema, Types } from "mongoose";

export interface IPageInfo {
  pageName: string;
  address: string;
  phone: string;
  pageCategory: string;
  shopId: string; // pageId
  accessToken: string; // subscribe 
  verifyToken: string; //random
}

const PageInfoSchema = new Schema<IPageInfo>({
  pageName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  pageCategory: { type: String, required: true },
  shopId: { type: String, required: true, unique: true },
  accessToken: { type: String, default: ''},
  verifyToken: { type: String, required: true },
});

export const PageInfo = mongoose.model<IPageInfo>("PageInfo", PageInfoSchema);
