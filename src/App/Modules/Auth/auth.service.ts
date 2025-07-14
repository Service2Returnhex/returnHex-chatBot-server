import ApiError from "../../utility/AppError";
import { User } from "../User/user.model";
import { IAuth } from "./auth.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { createToken, verifyToken } from "./auth.utils";
import { config } from "../../config/config";
import { JwtPayload } from "jsonwebtoken";
import sendEmail from "../../utility/SendEmail";

const loginUser = async (payload: IAuth) => {
  const user = await User.findOne({ email: payload.email }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  }
  if (user?.isDeleted) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User is Deleted");
  }
  if (user?.status === "blocked") {
    throw new ApiError(httpStatus.FORBIDDEN, "User is Blocked");
  }

  const isPassowrdMathced = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPassowrdMathced) {
    throw new ApiError(httpStatus.FORBIDDEN, "Passowrd did not matched!");
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };
  //generate access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expiresIn as string
  );
  ////generate refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expiresIn as string
  );

  return {
    accessToken,
    refreshToken,
  };
};
const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await User.findById(userData.userId).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  }
  const isPassowrdMathced = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );
  if (!isPassowrdMathced) {
    throw new ApiError(httpStatus.FORBIDDEN, "Passowrd did not matched!");
  }

  const newHashPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.soltRound)
  );

  const result = await User.findOneAndUpdate(
    {
      _id: userData.userId,
      role: userData.role,
    },
    { password: newHashPassword }
  );
  console.log(result);
  return null;
};

const refreshToken = async (token: string) => {
  if (!token) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,  
      "Token Not Found. Unauthorized user!"
    );
  }

  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  if (!decoded) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Could not verify token. Unauthorized user"
    );
  }
  const { userId } = decoded as JwtPayload;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  }
  if (user.isDeleted) {
    throw new ApiError(httpStatus.NOT_FOUND, "User is deleted");
  }
  if (user.status == "blocked") {
    throw new ApiError(httpStatus.NOT_FOUND, "User is blocked");
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };
  
  //generate access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expiresIn as string
  );

  return {
    accessToken,
  };
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
  //generate access token
  const resetPassToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    "10m"
  );

  //In url: passing id, and passtoken as query parameter
  const resetUILink = `${config.reset_pass_ui_link}?id=${user?._id}&token=${resetPassToken}`;
  sendEmail(user?.email, resetUILink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string
) => {
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User Not Found!");
  if (user.isDeleted)
    throw new ApiError(httpStatus.NOT_FOUND, "User is deleted");
  if (user.status == "blocked")
    throw new ApiError(httpStatus.NOT_FOUND, "User is blocked");
  
 
  const decoded = verifyToken(
    token,
    config.jwt_access_secret as string
  ) as JwtPayload;
 console.log("here")
  if (payload.id !== decoded.userId)
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden Access!");

  const hashNewPassword = await bcrypt.hash(payload?.newPassword, 10);
  await User.findOneAndUpdate(
    {
      _id: decoded.userId,
      role: decoded.role,
    },
    {
      password: hashNewPassword,
    }
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
