import axios from 'axios'
import { ShopInfo } from '../Modules/Page/shopInfo.model';
import ApiError from '../utility/AppError';

export const sendMessage = async (recipientId: string,  pageId: string, text: string) => {
  const shop = await ShopInfo.findOne({shopId: pageId})
  if(!shop) throw new ApiError(404, 'Shop Not Found!');

  const res = await axios.post(
    `https://graph.facebook.com/v23.0/me/messages?access_token=${shop.accessToken}`,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
  console.log(res.data);
};

export const replyToComment = async (commentId: string, pageId: string, message: string) => {
  
  const shop = await ShopInfo.findOne({shopId: pageId})
  if(!shop) throw new ApiError(404, 'Shop Not Found!');
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
};