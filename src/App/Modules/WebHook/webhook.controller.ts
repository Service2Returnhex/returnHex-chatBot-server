import { Request, Response, RequestHandler } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import httpStatus from "http-status";
import { WebHookService } from "./webhook.service";

export const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
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
