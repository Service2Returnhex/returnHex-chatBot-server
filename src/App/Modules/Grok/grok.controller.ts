import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { GrokService } from "./grok.service";

const getResponse: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await GrokService.getResponse(
      "Dummy-Sender-ID",
      req.body?.message
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Gemini response retrieved successfully",
      data: result,
    });
  }
);

export const GrokController = {
  getResponse,
};
