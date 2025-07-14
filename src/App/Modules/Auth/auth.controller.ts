import { Request, Response, RequestHandler } from "express"
import { catchAsync } from "../../utility/cathcAsync"
import sendResponse from "../../utility/sendResponse"
import httpStatus from 'http-status'
import { AuthServices } from "./auth.service"
import { config } from '../../config/config'

const loginUser: RequestHandler = catchAsync(
    async(req: Request, res: Response): Promise<any> => {
        const result = await AuthServices.loginUser(req.body)
        const {  accessToken, refreshToken} = result;

        res.cookie("refreshToken", refreshToken, {
            secure: config.node_env == "production",
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 365 //1 year 
        });
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Login Successfull",
            data: { accessToken }
        })
    }
)

const changePassword: RequestHandler = catchAsync(
    async(req: Request, res: Response): Promise<any> => {
        const result = await AuthServices.changePassword(req.user, req.body)
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Password Changed Successfully",
            data: result
        })
    }
)

//TODO: Need to fix later: cookies issues
const refreshToken: RequestHandler = catchAsync(
    async(req: Request, res: Response): Promise<any> => {
        // console.log(req.cookie);
        const result = await AuthServices.refreshToken(req.cookies.refreshToken);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Token is refreshed Successfully!",
            data: result
        })
    }
)

const forgetPassword: RequestHandler = catchAsync(
    async(req: Request, res: Response): Promise<any> => {
        const result = await AuthServices.forgetPassword(req.body.email)
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Please Check your mail!",
            data: result
        })
    }
)

const resetPassword: RequestHandler = catchAsync(
    async(req: Request, res: Response): Promise<any> => {
        const token = req.headers.authorization as string
        // console.log(token);
        const result = await AuthServices.resetPassword(req.body, token);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Password has been reset",
            data: result
        })
    }
)

export const AuthController = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword
}