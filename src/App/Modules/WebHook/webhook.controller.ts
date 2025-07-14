import { Request, Response, RequestHandler } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { WebHookService } from "./webhook.service";

export const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await WebHookService.handleWebhook(req.query, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Webhook handled successfully",
      data: result,
    });
  }
);

export const WebHookController = {
  handleWebhook,
};
