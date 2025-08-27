import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { config } from "../../config/config";
import { AuthServices } from "./auth.services";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";

export const loginUser: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<any> => {
    const result = await AuthServices.loginUser(req.body);

    const { accessToken, refreshToken, userRole, id } = result;

    res.cookie("refreshToken", refreshToken, {
      secure: config.node_env === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Loign Successfully",
      data: { accessToken, userRole, id },
    });
  }
);

const changePassword: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<any> => {
    const result = await AuthServices.changePassword(req.user, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed Successfully",
      data: result,
    });
  }
);

const refreshToken: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<any> => {
    const result = await AuthServices.refreshToken(req.cookies.refreshToken);
    
    const { newRefreshToken, newAccessToken } = result;

    res.cookie("refreshToken", newRefreshToken, {
      secure: config.node_env === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Token is refresed Successfully",
      data: { newAccessToken },
    });
  }
);

const forgetPassword: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<any> => {
    const result = await AuthServices.forgetPassword(req.body.email);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Please Check your email",
      data: result,
    });
  }
);

const resetPassword: RequestHandler = catchAsync(
  async (req: Request, res: Response): Promise<any> => {
    const token = req.headers.authorization as string;
    const result = await AuthServices.resetPassword(req.body, token);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password has been reset",
      data: result,
    });
  }
);

export const AuthController = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
