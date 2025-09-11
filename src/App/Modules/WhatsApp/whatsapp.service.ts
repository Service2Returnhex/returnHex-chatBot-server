// src/services/WhatsApp/whatsapp.service.ts
import { sendTextMessage } from "../../api/whatsapp.api";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { PageService } from "../Page/page.service";

export const WhatsAppService = {
  /**
   * reqBody is the raw body from the webhook POST
   */
  async handleIncomingMessages(reqBody: any, shopId: string) {
    if (!reqBody) return;
    // typical shape: { object: 'whatsapp_business_account', entry: [ { id: '...', changes: [ { value: { messages: [...] } } ] } ] }
    if (reqBody.object !== "whatsapp_business_account") {
      console.log("Not a WhatsApp webhook payload.");
      return;
    }

    for (const entry of reqBody.entry || []) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        // messages (incoming)
        if (Array.isArray(value.messages)) {
          for (const msg of value.messages) {
            await this._handleSingleMessage(msg, value, shopId);
          }
        }

        // statuses (delivery/read) if you need them:
        if (Array.isArray(value.statuses)) {
          // handle statuses
          console.log("WhatsApp statuses:", value.statuses);
        }
      }
    }
  },

  async _handleSingleMessage(msg: any, metadata: any, shopId: string) {
    // msg fields: from (phone number), id, timestamp, text|image|document...
    const from = msg.from; // sender phone in E.164
    const phoneNumberId =
      metadata?.metadata?.phone_number_id ||
      metadata?.phone_number_id ||
      (await PageService.getWhatsappPhoneNumberId(shopId));
    const type = msg.type || (msg.text && "text");

    console.log("WhatsApp message from:", from, "type:", type);

    // simple: if text, send to ChatGPT service to generate reply (you already have ChatgptService)
    if (type === "text" || msg.text) {
      const userText = msg.text?.body || msg.text;
      // you could call ChatGPT/Gemini based on shop config:
      const reply = await ChatgptService.getResponseDM(
        from,
        shopId,
        userText,
        "reply"
      );
      try {
        await sendTextMessage(
          from,
          phoneNumberId,
          reply || "ধন্যবাদ — আমরা আপনার মেসেজ পেয়েছি।"
        );
      } catch (err: any) {
        console.error("Error sending whatsapp reply:", err?.message);
      }
      return;
    }

    // handle attachments
    if (msg.image || msg.document || msg.video) {
      // For now notify not allowed and escalate
      const shortReply =
        "সংযুক্তি বা ভিডিও, ছবি, ফাইল এখনও অনুমোদিত নয়। আমাদের কাস্টমার সার্ভিস আপনার সাথে যোগাযোগ করবে।";
      try {
        await sendTextMessage(from, phoneNumberId, shortReply);
      } catch (err: any) {
        console.error("Error sending whatsapp attachment reply:", err?.message);
      }
      return;
    }

    console.log("Unhandled WhatsApp message type:", msg);
  },
};

export default WhatsAppService;
