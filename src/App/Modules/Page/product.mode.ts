import mongoose, {Schema,Types } from "mongoose";
export interface IProduct {
  name?: string;
  description?: string;
  price?: string;
  postId: string;
  message: string;
  shopId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: String, default: "" },
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    message: { type: String, required: true, default: "" },
    shopId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
