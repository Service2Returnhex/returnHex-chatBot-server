import axios from "axios";

const TOKEN = process.env.PAGE_ACCESS_TOKEN;

export async function callSendAPI(psid: string, text: string) {
  await axios.post(
    `https://graph.facebook.com/v12.0/me/messages?access_token=${TOKEN}`,
    { recipient: { id: psid }, message: { text } }
  );
}
