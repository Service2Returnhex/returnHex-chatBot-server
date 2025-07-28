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
const config_1 = require("../config/config");
const auth_utils_1 = require("../Modules/Auth/auth.utils");
const user_model_1 = require("../Modules/User/user.model");
const AppError_1 = __importDefault(require("../utility/AppError"));
const cathcAsync_1 = require("../utility/cathcAsync");
const http_status_1 = __importDefault(require("http-status"));
const auth = (...requireRoles) => {
    return (0, cathcAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Token Not Found. Unauthorized user!");
        }
        let decoded; //payload will be reserved
        try {
            decoded = (0, auth_utils_1.verifyToken)(token, config_1.config.jwt_access_secret);
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Could not verify token. Unauthorized user");
        }
        const { userId, role } = decoded;
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User Not Found!");
        }
        if (user.isDeleted) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User is deleted");
        }
        if (user.status == 'blocked') {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User is blocked");
        }
        if (requireRoles && !requireRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Role mismatched. Unauthorized!");
        }
        req.user = decoded;
        next();
    }));
};
exports.default = auth;
