import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { DeepSeekService } from "./deepseek.service";

const getResponse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DeepSeekService.getResponseDM(
      "dummy-user",
      req.body.message
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "DeepSeek response retrieved successfully",
      data: result,
    });
  }
);

export const DeepSeekController = {
  getResponse,
};
