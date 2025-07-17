import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
export interface IProduct extends Document {
  name: string;
  description: string;
  price: string;
  postId: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    postId: {
      type: String,
      required: true,
      default: uuidv4,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
