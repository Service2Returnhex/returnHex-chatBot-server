import mongoose, { Schema } from "mongoose";

export interface IOrder {
  userId: string;
  shopId: string;
  customerName: string;
  productName: string;
  quantity: number;
  address: string;
  paymentMethod: string;
  contact: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  shopId: { type: String, required: true },
  customerName: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  contact: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
