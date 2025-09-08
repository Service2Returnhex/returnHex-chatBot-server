import { Schema } from "mongoose";

export interface IImageItem {
  url: string;
  // photoId?: number;
  caption?: string;
  embedding?: number[]; // embedding for this image
  phash?: string;
}

export const ImageItemSchema = new Schema<IImageItem>({
  url: { type: String, required: true },
  // photoId: { type: Number },
  caption: { type: String, default: "" },
  embedding: { type: [Number], default: [] },
  phash: { type: String, default: "" },
});
