import { Request, Response, RequestHandler } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { ChatgptService } from "./chatgpt.service";

const getResponse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ChatgptService.getResponse(req.body);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "ChatGPT response retrieved successfully",
      data: result,
    });
  }
);

export const ChatgptController = {
    getResponse
}
