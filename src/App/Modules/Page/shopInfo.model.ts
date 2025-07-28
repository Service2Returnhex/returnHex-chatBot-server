// src/App/Models/ShopInfo.model.ts

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShopInfo extends Document {
  pageId: string;
  verifyToken: string;
  pageAccessToken: string;
  pageName: string;
  address: string;
  phone: string;
  pageCategory: string;
}

const ShopInfoSchema = new Schema<IShopInfo>(
  {
    pageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    verifyToken: {
      type: String,
      required: true,
      trim: true,
    },
    pageAccessToken: {
      type: String,
      required: true,
      trim: true,
    },
    pageName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    pageCategory: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const ShopInfo: Model<IShopInfo> = mongoose.model<IShopInfo>(
  "ShopInfo",
  ShopInfoSchema
);
