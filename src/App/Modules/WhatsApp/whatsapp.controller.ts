// src/controllers/whatsapp.controller.ts
import { Request, RequestHandler, Response } from "express";
import { catchAsync } from "../../utility/cathcAsync";
import { PageService } from "../Page/page.service";
import WhatsAppService from "./whatsapp.service";

export const verifyWhatsAppWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // GET /webhook/whatsapp/:shopId?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
    const { shopId } = req.params;
    console.log("pageid", shopId);
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const shop = await PageService.getShopById(shopId);

    // token stored either in shop.whatsapp.verifyToken or global env
    const expectedToken =
      shop?.whatsapp?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token === expectedToken) {
      // mark shop whatsapp verified if needed
      if (shop) {
        await PageService.updateShop(shopId, {
          whatsapp: { isVerified: true },
        });
      }
      console.log("WhatsApp Webhook verified for shop:", shopId);
      res.status(200).send(challenge);
      return;
    }

    console.log("WhatsApp Webhook verification failed for shop:", shopId);
    res.sendStatus(403);
    return;
  }
);

export const handleWhatsAppIncoming: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // POST from WhatsApp Cloud API
    const { shopId } = req.params;
    const shop = await PageService.getShopById(shopId);
    const isStarted = shop?.whatsapp?.isStarted;

    // respond quickly to acknowledge receipt of the webhook
    res.sendStatus(200);

    if (!isStarted) {
      console.log("WhatsApp handling is disabled for shop:", shopId);
      return;
    }

    try {
      await WhatsAppService.handleIncomingMessages(req.body, shopId);
    } catch (err: any) {
      console.error(
        "Error in WhatsAppService.handleIncomingMessages:",
        err?.message
      );
    }
  }
);
