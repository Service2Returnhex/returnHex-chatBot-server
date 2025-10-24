import { botConfig } from "../../config/botConfig";
import { Order } from "./order.model";
import { IPageInfo } from "./pageInfo.model";
import { IPost } from "./post.model";

export const makePromtDM = async (
  page: IPageInfo,
  posts: IPost[],
  senderId: string
): Promise<string> => {
  let postList = "";
  const recentPost =
    posts.length > botConfig.postVisibility
      ? posts.slice(-botConfig.postVisibility)
      : posts;
  if (recentPost.length > 0) {
    postList = recentPost
      .map(
        (p, i) => `
  ${i + 1} - Description: ${!p.summarizedMsg ? p.message : p.summarizedMsg}
  Image urls: ${p.images && p.images.length > 0
  ? p.images.map((img, idx) => `url-${idx + 1}: ${img.url}`).join("\n")
  : "No images urls"}
  Image details: ${p.images && p.images.length > 0
  ? p.images.map((img, idx) => `details-${idx + 1}: ${img.imageDescription}`).join("\n")
  : "No image details"}
  `
      )
      .join(",");
    recentPost.length === botConfig.postVisibility
      ? (postList += `\n visite our page for ${posts.length - recentPost.length
        } more(can be products, service etc page category)...`)
      : "";
  }

  console.log("recent Posts: ", postList);
  const userOrders = await Order.find({ userId: senderId, shopId: page.shopId })
    .sort({ createdAt: -1 })
    .lean();

  let orderList = "";
  if (userOrders.length > 0) {
    orderList = userOrders
      .map(
        (o, i) => `
${i + 1}. OrderID: ${o._id}, customername: ${o.customerName}, Product: ${o.productName},
contact: ${o.contact}, address: ${o.address}, paymentMethod: ${o.paymentMethod},
Quantity: ${o.quantity}, Status: ${o.status}`
      )
      .join("\n");
  } else {
    orderList = "No existing orders found for this user.";
  }

  const shopInfo = page.summary.length
    ? page.summary
    : `PageName: ${page.pageName}, Category: ${page.pageCategory ?? "N/A"
    }, Address: ${page?.address ?? "N/A"}
  Phone: ${page?.phone ? page.phone : "N/A"}, Email: ${page?.email ? page.email : "N/A"
    }, MoreInfo: ${page?.moreInfo ?? "N/A"}
  `;

  const systemPrompt = `
Page information: ${shopInfo}

Recent posts(can be products, service etc page category):
${postList.length > 0
      ? postList
      : "The posts(can be products, service etc page category) list is empty"
}

Existing Orders for this user:
${orderList}

if image information arise then try to talk about the matched image or similar type images.(eg. we have that, stock available, similar type available, etc)
If not even close then say no similar thing founds!(eg. no similar thing founds, we don't have that, not available in stock etc)

more system instructions:
${page?.dmSystemPromt ? page?.dmSystemPromt : "not provided"}

If the user wants to specific images or all images, reply with structured JSON in this format only:
{
  "action" : "imagesView",
  "images" : [array of image urls that asks for],
  "message" : "Generated relavent message to reply with images"
}

If the user wants to confirm an order, update an order, or cancel an order, reply with structured JSON in one of these formats only:

### Confirm Order
{
  "action": "confirmOrder",
  "name": "Customer Name",
  "productName": "Product Name",
  "quantity": "Quantity",
  "address": "Address",
  "contact": "Contact",
  "paymentMethod": "Payment Method"
}

### Update Order
{
  "action": "updateOrder",
  "orderId": "Must match one of the above listed OrderIDs",
  "updates": {
    "productName": "New Product Name (if changed)",
    "quantity": "New Quantity (if changed)",
    "address": "New Address (if changed)",
    "contact": "New Contact (if changed)",
    "paymentMethod": "New Payment Method (if changed)"
  }
}

### Cancel Order
{
  "action": "cancelOrder",
  "productName": "cancelled product name",
  "orderId": "Must match one of the above listed OrderIDs"
}

### Get Order Status
{
  "orderId": "Must match one of the above listed OrderIDs",
  "productName": "productName",
  "action": "getOrderStatus",
}

If any required field is missing, ask the user to provide it before proceeding.  

Otherwise, continue normal chat.  
Answer as short as possible but Always give the most natural and helpful response in the related context.
You can use maximum ${botConfig.mainAIMaxToken} tokens.
`.trim();

  return systemPrompt;
};

export const makePromtComment = (
  page: IPageInfo,
  posts: IPost[],
  specificPost: any
): string => {
  let postList = "";
  const recentPost =
    posts.length > botConfig.postVisibility
      ? posts.slice(-botConfig.postVisibility)
      : posts;
  if (recentPost.length > 0) {
    postList = recentPost
      .map(
        (p, i) => `
  ${i + 1}. ${!p.summarizedMsg ? p.message : p.summarizedMsg}`
      )
      .join(",");
    recentPost.length === botConfig.postVisibility
      ? (postList += `\n visite our page for ${posts.length - recentPost.length
        } more(can be products, service etc page category)...`)
      : "";
  }

  const shopInfo = page.summary.length
    ? page.summary
    : `PageName: ${page.pageName}, Category: ${page.pageCategory ?? "N/A"
    }, Address: ${page?.address ?? "N/A"}
  Phone: ${page?.phone ? page.phone : "N/A"}, Email: ${page?.email ? page.email : "N/A"
    }, MoreInfo: ${page?.moreInfo ?? "N/A"}
  `;

  const systemPrompt = `
  Page information: ${shopInfo}
  In case of comment replay first priority to say about commented post.
  commented post details: ${specificPost
      ? `User Wants to know about this post in comment- Details: ${specificPost.message}`
      : ""
    } 
  Recent posts(can be products, service etc page category): ${postList.length > 0 ? postList : ""
    }
  more system instructions: ${page?.cmntSystemPromt ? page.cmntSystemPromt : ""}
  
  answer as short as possible but in related context(no extra, additonal and irrelevant things). 
  You can use maximum ${botConfig.mainAIMaxToken} token
  `.trim();

  return systemPrompt;
};
