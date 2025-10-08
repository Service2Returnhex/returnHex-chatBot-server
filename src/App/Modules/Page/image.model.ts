import { Schema } from "mongoose";

export interface IImageItem {
  url: string;
  photoId?: number;
  caption?: string;
}

export const ImageItemSchema = new Schema<IImageItem>({
  url: { type: String, required: true },
  photoId: { type: Number },
  caption: { type: String, default: "" },
});
