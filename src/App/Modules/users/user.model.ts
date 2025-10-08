import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "name is required"]
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email must be unique"]
  },
  contact: { type: String, default: "No contact available" },
  address: { type: String, default: "No address available" },
  password: {
    type: String,
    required: [true, "password is required"]
  },
  image: {
    type: String
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    // required: [true, "role is required"],
    default: "user"
  },
  status: {
    type: String,
    enum: ["in-progress", "blocked"],
    default: "in-progress"
  },
  isDeleted: {
    type: Boolean,
    required: [true, 'Deleted status is required'],
    default: false
  }
});

export const User = model<IUser>("User", userSchema);
