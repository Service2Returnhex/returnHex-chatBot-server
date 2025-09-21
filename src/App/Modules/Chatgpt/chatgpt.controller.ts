import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { ChatgptService } from "./chatgpt.service";

const getResponse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ChatgptService.getResponseDM('dummy-user', "dummy-shopid", req.body.message);
    console.log("result",result);
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
