import mongoose, { Schema } from "mongoose";

export interface IPageInfo {
  pageName: string;
  address: string;
  phone: string;
  email?: string;
  pageCategory: string;
  shopId: string;
  moreInfo?: string;
  dmSystemPromt?: string;
  cmntSystemPromt?: string;
  isVerified?: boolean;
  isStarted?: boolean;
  accessToken: string;
  verifyToken: string;

  whatsapp?: {
    isStarted?: boolean;
    isVerified?: boolean;
    phoneNumberId?: string;
    businessAccountId?: string;
    verifyToken?: string;
    whatsappAccessToken?: string;
    displayPhoneNumber?: string;
  };
}

const PageInfoSchema = new Schema<IPageInfo>({
  pageName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  pageCategory: { type: String, required: true },
  shopId: { type: String, required: true, unique: true },
  moreInfo: { type: String, default: "" },
  dmSystemPromt: { type: String, default: "" },
  cmntSystemPromt: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  isStarted: { type: Boolean, default: false },
  accessToken: {
    type: String,
    default: "",
    match: [
      /^EAA[a-zA-Z0-9_\-]{50,}$/,
      "Invalid Facebook Page Access Token format",
    ],
  },
  verifyToken: { type: String, required: true },

  whatsapp: {
    isStarted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    phoneNumberId: { type: String, default: "" }, // e.g. "105123456789012"
    businessAccountId: { type: String, default: "" }, // WABA id
    displayPhoneNumber: { type: String, default: "" },
    whatsappAccessToken: {
      type: String,
      default: "",
      // not enforcing the same regex as accessToken because tokens vary;
      // if you want to enforce, uncomment or change the regex accordingly.
      // match: [/^EAA[a-zA-Z0-9_\-]{50,}$/, 'Invalid WhatsApp Access Token format'],
    },
    verifyToken: { type: String, default: "" }, // per-shop verify token for webhook verification
    webhookLastVerifiedAt: { type: Date, default: null },
  },
});

export const PageInfo = mongoose.model<IPageInfo>("PageInfo", PageInfoSchema);
