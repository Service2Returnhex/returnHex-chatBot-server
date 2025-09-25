import axios from "axios";
import { PageInfo } from "../Modules/Page/pageInfo.model";
import ApiError from "../utility/AppError";

export const sendMessage = async (
  recipientId: string,
  pageId: string,
  text: string
) => {
  try {
    const shop = await PageInfo.findOne({ shopId: pageId });
    if (!shop) throw new ApiError(404, "Shop Not Found!");
    console.log("Sending Replay....");
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/me/messages?access_token=${shop.accessToken}`,
      {
        recipient: { id: recipientId },
        message: { text },
      }
    );
    console.log(res.data);
  } catch (error: any) {
    console.error("[Meta-API]-Message Sending Failed: ", error.message);
  }
};

export const replyToComment = async (
  commentId: string,
  pageId: string,
  message: string,
  userId: string
) => {
  try {
    const shop = await PageInfo.findOne({ shopId: pageId });
    if (!shop) throw new ApiError(404, "Shop Not Found!");
    console.log("Sending Replay....");
    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${commentId}/comments`,
      {
        message,
      },
      {
        params: {
          access_token: shop.accessToken,
        },
      }
    );
    console.log("✅ Comment reply sent:", response.data);
  } catch (error: any) {
    console.error("[Meta-API]-Replay to comment Failed: ", error.message);
  }
};
