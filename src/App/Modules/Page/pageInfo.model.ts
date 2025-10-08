import mongoose from "mongoose";

export interface ITokenUsage {
  inputToken: number;
  outputToken: number;
  totalToken: number;
}

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
  connected?: "stop" | "pending" | "start";
  isStarted: boolean;
  tokenUsage: ITokenUsage;
  accessToken: string;
  verifyToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TokenUsageSchema = new mongoose.Schema<ITokenUsage>(
  {
    inputToken: { type: Number, required: true, default: 0 },
    outputToken: { type: Number, required: true, default: 0 },
    totalToken: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

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
  connected: {
    type: String, enum: ["stop", "pending", "start"],
    default: "pending"
  },
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
  tokenUsage: { type: TokenUsageSchema, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

export const PageInfo = mongoose.model<IPageInfo>("PageInfo", PageInfoSchema);
