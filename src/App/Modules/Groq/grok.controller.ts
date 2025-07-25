import { RequestHandler, Request, Response } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { GroqService } from "./grok.service";

const getResponse: RequestHandler = catchAsync(
    async(req: Request, res: Response) => {

        const result = await GroqService.getResponseDM("Dummy-Sender-ID", req.body?.message);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Groq response retrieved successfully",
            data: result
        })
    }
)


export const GroqController = {

    getResponse
}