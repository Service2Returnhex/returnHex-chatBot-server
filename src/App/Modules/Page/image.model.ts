import { Schema } from "mongoose";

export interface IImageItem {
  url: string;
  embedding?: number[]; // embedding for this image
}

export const ImageItemSchema = new Schema<IImageItem>({
  url: { type: String, required: true },
  embedding: { type: [Number], default: [] },
});