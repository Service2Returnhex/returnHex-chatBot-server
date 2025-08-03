import mongoose, { Schema, Types } from "mongoose";

export interface IPageInfo {
  pageName: string;
  address: string;
  phone: string;
  email: string;
  pageCategory: string;
  shopId: string; 
  moreInfo?: string;
  dmSystemPromt?: string;
  cmntSystemPromt?: string;
  accessToken: string; 
  verifyToken: string;
}

const PageInfoSchema = new Schema<IPageInfo>({
  pageName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true},
  pageCategory: { type: String, required: true },
  shopId: { type: String, required: true, unique: true },
  moreInfo: { type: String, default: ''},
  dmSystemPromt: {type: String, default: ''},
  cmntSystemPromt: {type: String, default: ''},
  accessToken: { type: String, default: ''},
  verifyToken: { type: String, required: true },
});

export const PageInfo = mongoose.model<IPageInfo>("PageInfo", PageInfoSchema);
