import mongoose from "mongoose";


export interface IPageInfo {
  pageName: string;
  address: string;
  phone: string;
  email?: string;
  pageCategory: string;
  shopId: string;
  moreInfo?: string;
  ownerId: string;
  summary: string;
  dmSystemPromt?: string;
  cmntSystemPromt?: string;
  isVerified?: boolean;
  isStarted?: boolean;
  accessToken: string;
  verifyToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}



const PageInfoSchema = new mongoose.Schema<IPageInfo>({
  pageName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  pageCategory: { type: String, required: true },
  shopId: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  moreInfo: { type: String, default: '' },
  summary: { type: String, default: '' },
  dmSystemPromt: { type: String, default: '' },
  cmntSystemPromt: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isStarted: { type: Boolean, default: false },
  accessToken: {
    type: String,
    default: '',
    match: [
      /^EAA[a-zA-Z0-9_\-]{50,}$/,
      'Invalid Facebook Page Access Token format',
    ],
  },
  verifyToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PageInfo = mongoose.model<IPageInfo>("PageInfo", PageInfoSchema);
