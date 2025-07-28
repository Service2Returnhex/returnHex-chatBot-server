import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utility/cathcAsync";
import sendResponse from "../../utility/sendResponse";
import { ShopInfo } from "../Page/shopInfo.model";
import { WebHookService } from "./webhook.service";

export const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { pageId } = req.params;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Look up that page’s verifyToken
    const shop = await ShopInfo.findOne({ pageId });
    if (!shop) return res.sendStatus(httpStatus.NOT_FOUND);

    if (mode && token && mode === "subscribe" && token === shop.verifyToken) {
      console.log("Webhook verified!");
      res.status(200).send(challenge);
      return;
    } else {
      console.warn(`❌ Webhook verification failed for page ${pageId}`);
      res.sendStatus(403);
    }
  }
);

enum WebHookMethods {
  GEMINI = "gemini",
  CHATGPT = "chatgpt",
  DEEPSEEK = "deepseek",
  GROQ = "groq",
}

export const handleIncomingMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { pageId } = req.params;

    const shop = await ShopInfo.findOne({ pageId });
    if (!shop) {
      console.error(`Unknown pageId ${pageId}`);
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    // res.sendStatus(httpStatus.OK);
    // const userIP = [
    //   { ip: "192.168.10.2", count: 20 }, //rate limiting
    // ];
    /*
    0. Check IP first and collect the IP
      0.1 Same IP cannot make request more than 20 times  
      0.2 If same if hit 21 times send custom replay. [Custom Replay - We'll contact with you]
    1.check comment or message
       1.1 Check message not more than 20 token
       1.2 If message include price then price details sending
       1.3  If message include location then location details sending   
    2. Check comment or message not more than 20 token
       2.1 If comment is more than 20 token, sent coustom replay. [Please call us for more information]
    4. Else rest of the work!
      4.1 If client toke is 20 - replay will  not be more than 50 token
      4.2 If '' '' '' 10 token - "" "" "" 20 token 
    5. Rest of the wortk
    */
    // res.sendStatus(200);
    const result = await WebHookService.handleIncomingMessages(
      req.body,
      shop.pageAccessToken,
      shop.pageId,
      WebHookMethods.GEMINI
    );
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
