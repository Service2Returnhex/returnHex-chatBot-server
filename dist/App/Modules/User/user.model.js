"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
});
exports.User = mongoose_1.default.model("User", userSchema);
