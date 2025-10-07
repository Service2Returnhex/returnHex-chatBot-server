import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { PageService } from "../Page/page.service";
import { WebHookService } from "./webhook.service";

export const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { pageId } = req.params;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const shop = await PageService.getShopById(pageId);

    if (mode && token && mode === "subscribe" && token === shop.verifyToken) {
      console.log("Webhook verified!");
      await PageService.updateShop(pageId, { isVerified: true });
      res.status(200).send(challenge);
    } else {
      console.log("Webhook Not Verified");
      res.sendStatus(403);
    }
  }
);

enum AiType {
  GEMINI = "gemini",
  CHATGPT = "chatgpt",
  DEEPSEEK = "deepseek",
  GROQ = "groq",
}

export const handleIncomingMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { pageId } = req.params;
    const shop = await PageService.getShopById(pageId);
    const isStartedApp = shop?.isStarted;

    let result = null;

    if (isStartedApp) {
      result = await WebHookService.handleIncomingMessages(
        req,
        res,
        pageId as string,
        AiType.CHATGPT
      );
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: isStartedApp
        ? "Incoming messages handled successfully"
        : "App is on Off State",
      data: result,
    });
  }
);




export const WebHookController = {
  handleWebhook,
  handleIncomingMessages,
};
