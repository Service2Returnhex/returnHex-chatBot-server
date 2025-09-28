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
  // full_picture: string;
  // imageHash?: string;
  // embedding?: number[];
  images?: IImageItem;
  aggregatedEmbedding?: number[];

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
  // imageHash: String,
  // embedding: { type: [Number], default: [] },
  images: { type: [ImageItemSchema], default: [] },
  aggregatedEmbedding: { type: [Number], default: [] },
  shopId: { type: String, required: true },
  isTrained: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
