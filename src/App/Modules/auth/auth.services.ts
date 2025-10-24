import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { config } from "../../config/config";
import { createEmailHtml } from "../../html/resetUI";
import { IAuth } from "./auth.interface";
import { createToken, verifyToken } from "./auth.utils";
import { User } from "../users/user.model";
import ApiError from "../../utility/AppError";
import sendEmail from "../../utility/sendEmail";
import { RefreshToken } from "./auth.refreshToken.model";
import jwt from 'jsonwebtoken'

export const loginUser = async (paylaod: IAuth) => {
  const user = await User.findOne({ email: paylaod.email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  if (user?.isDeleted)
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is Deleted");
  if (user?.status === "blocked")
    throw new ApiError(httpStatus.FORBIDDEN, "User is Blocked");

  const isPasswordMatched = await bcrypt.compare(
    paylaod.password,
    user.password
  );

  if (!isPasswordMatched)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Passowrd did not matched!");
  
  const jwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  })

  return {
    accessToken,
    refreshToken,
    userRole: user.role,
    id: user._id,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await User.findById(userData.userId).select("+password");
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");

  if (user?.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is Deleted");
  }
  if (user?.status == "blocked") {
    throw new ApiError(httpStatus.FORBIDDEN, "User is Deleted");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );

  if (!isPasswordMatched)
    throw new ApiError(httpStatus.FORBIDDEN, "Passowrd did not matched!");

  const newHashPassword = await bcrypt.hash(payload.newPassword, 10);

  const result = await User.findOneAndUpdate(
    {
      _id: userData.userId,
      role: userData.role,
    },
    { password: newHashPassword }
  );
  return result;
};

const refreshToken = async (oldToken: string) => {
  if (!oldToken)
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Token not Found. Unauthorized User!"
    );

   const decoded = verifyToken(
    oldToken,
    config.jwt_refresh_secret as string
  ) as JwtPayload;
  if (!decoded)
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Couldn't verify the token. Unauthorized User!"
    );

  const existingToken = await RefreshToken.findOne({token: oldToken});
  if(!existingToken) throw new ApiError(httpStatus.UNAUTHORIZED, "Token expired or invalid!");

  const { userId } = decoded;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  if (user.isDeleted)
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is Deleted");
  if (user.status === "blocked")
    throw new ApiError(httpStatus.FORBIDDEN, "User is blocked");

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const newAccessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );
  const newRefreshToken = createToken(jwtPayload, 
    config.jwt_refresh_secret as string, 
    config.jwt_refresh_expires_in as string)
  
  await RefreshToken.create({
    token: newRefreshToken,
    user: userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  await existingToken.deleteOne();

  return { newAccessToken, newRefreshToken };
};

const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  if (user.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, "User is deleted");
  if (user.status == "blocked")
    throw new ApiError(httpStatus.NOT_FOUND, "User is blocked");

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const resetPassToken = createToken(
    jwtPayload,
    config.jwt_reset_secret as string,
    config.jwt_reset_expires_in as string
  );

  const resetUILink = `${process.env.RESET_PASS_UI_LINK}?id=${user?._id}&token=${resetPassToken}`;
  const resetUI = createEmailHtml(user?.name, resetUILink);
  sendEmail(user?.email, "Reset your password", resetUI);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string
) => {
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  if (user.isDeleted)
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is deleted");
  if (user.status == "blocked")
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is blocked");

  const decoded = verifyToken(
    token,
    config.jwt_reset_secret as string
  ) as JwtPayload;
  if (payload.id !== decoded.userId)
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden Access!");

  const hashNewPassword = await bcrypt.hash(payload?.newPassword, 10);
  await User.findOneAndUpdate(
    {
      _id: decoded.userId,
      role: decoded.role,
    },
    { password: hashNewPassword }
  );
};

const logoutUser = async (token: string) => {
  
  const decoded = jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload;
  if (!decoded) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Token");

  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");

  if (user.isDeleted)
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is deleted");
  if (user.status == "blocked")
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is blocked"); 
  await RefreshToken.deleteMany({ user: decoded.userId });
  return { message: "User logged out successfully" };
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  logoutUser
};
