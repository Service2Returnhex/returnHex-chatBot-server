import { Schema } from "mongoose";

export interface IImageItem {
  url: string;
  photoId?: number;
  caption?: string;
  imageDescription?: string;
}

export const ImageItemSchema = new Schema<IImageItem>({
  url: { type: String, required: true },
  photoId: { type: Number },
  caption: { type: String, default: "" },
  imageDescription: { type: String, default: "" },
});
