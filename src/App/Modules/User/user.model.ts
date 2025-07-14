import mongoose from "mongoose"
import { IUser } from "./user.interface";

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "User Already Exists"]
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        require: true,
        enum: ["admin", "doctor", "patient", "staff"]
    },
    status: {
        type: String,
        enum: ['in-progress', 'blocked'],
        required: true,
        default: "in-progress"
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
})

export const User = mongoose.model<IUser>("User", userSchema);