import { Request, Response, RequestHandler } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { WebHookService } from "./webhook.service";

export const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await WebHookService.verifyWebhook(req, res);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Webhook handled successfully",
      data: result,
    });
  }
);

enum WebHookMethods {
    GEMINI = "gemini",
    CHATGPT = "chatgpt",
}

export const handleIncomingMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await WebHookService.handleIncomingMessages(req, res, WebHookMethods.CHATGPT);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Incoming messages handled successfully",
      data: result,
    });
  }
);

export const WebHookController = {
  handleWebhook,
  handleIncomingMessages,
};
