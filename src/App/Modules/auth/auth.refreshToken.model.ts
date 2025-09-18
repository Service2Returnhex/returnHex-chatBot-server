import mongoose, { mongo, Types } from "mongoose";

export interface IRefreshToken {
    token: string;
    user: Types.ObjectId;
    expiresAt: Date;
}

const RefreshTokenSchema = new mongoose.Schema<IRefreshToken>({
    token: { type: String, required: true},
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true},
    expiresAt: { type: Date, required: true}
})

export const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

