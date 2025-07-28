"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const user_model_1 = require("./user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AppError_1 = __importDefault(require("../../utility/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = require("../../config/config");
//create
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.User.findOne({ email: payload.email });
    if (existingUser)
        throw new AppError_1.default(http_status_1.default.CONFLICT, "User Already Exists");
    const hashPassword = yield bcrypt_1.default.hash(payload.password, Number(config_1.config.soltRound));
    payload.password = hashPassword;
    const result = yield user_model_1.User.create(payload);
    const userData = {
        name: payload.name,
        email: payload.email,
        user: result._id,
    };
    // createDataByRole(payload, userData);
    // if (payload.role === "staff") {
    //   await Staff.create(userData);
    // } else if (payload.role === "doctor") {
    //   await Doctor.create(userData);
    // } else if (payload.role === "admin") {
    //   await Admin.create(userData);
    // } else if (payload.role === "patient") {
    //   await Patients.create(userData);
    // } else {
    //   throw new Error("NO Role Matched");
    // }
    return result;
});
//read
const getAllUsersFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.find({ isDeleted: false });
    return result;
});
const getOneUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(id, { isDeleted: false });
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User Not Found");
    return result;
});
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOne({ email: email });
    return result;
});
//update
const updateOneUserToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.User.findById(id);
    if (!isUserExists)
        throw new AppError_1.default(409, "User Not Found!");
    const result = yield user_model_1.User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
exports.UserServices = {
    createUserToDB,
    getOneUserFromDB,
    getAllUsersFromDB,
    getUserByEmail,
    updateOneUserToDB,
};
