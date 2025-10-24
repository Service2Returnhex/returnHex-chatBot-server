import mongoose, { Schema } from "mongoose";
import { IImageItem, ImageItemSchema } from "./image.model";
export interface IPost {
  name?: string;
  description?: string;
  price?: string;
  postId: string;
  message: string;
  summarizedMsg?: string;
  full_picture: string;
  shopId: string;
  isTrained?: boolean;
  images?: IImageItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>({
  name: { type: String, default: "" },
  description: { type: String, default: "" },
  price: { type: String, default: "" },
  postId: {
    type: String,
    required: true,
    unique: true,
  },
  message: { type: String, required: true, default: "" },
  summarizedMsg: { type: String, default: ""},
  full_picture: { type: String, default: "" },
  images: { type: [ImageItemSchema], default: [] },
  shopId: { type: String, required: true },
  isTrained: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
