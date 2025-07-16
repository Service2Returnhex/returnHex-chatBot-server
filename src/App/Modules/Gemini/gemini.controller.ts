import { RequestHandler, Request, Response } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { GeminiService } from "./gemini.service";

const getResponse: RequestHandler = catchAsync(
    async(req: Request, res: Response) => {

        const result = await GeminiService.getResponse("Dummy-Sender-ID", req.body?.message);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Gemini response retrieved successfully",
            data: result
        })
    }
)


export const GeminiController = {

    getResponse
}