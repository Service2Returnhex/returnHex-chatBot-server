import { botConfig } from "../../config/botConfig";
import { Order } from "./order.model";
import { IPageInfo } from "./pageInfo.model";
import { IPost } from "./post.mode";

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
  ${i + 1}. ${!p.summarizedMsg ? p.message : p.summarizedMsg}`
      )
      .join(",");
    recentPost.length === botConfig.postVisibility
      ? (postList += `\n visite our page for ${posts.length - recentPost.length
        } more(can be products, service etc page category)...`)
      : "";
  }
  const userOrders = await Order.find({ userId: senderId, shopId: page.shopId })
    .sort({ createdAt: -1 })  // newest first
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
      : "Say No posts(can be products, service etc page category) available. if the list is empty"
    }

Existing Orders for this user:
${orderList}

more system instructions:
${page?.dmSystemPromt ?? "not provided"}

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
Answer as short as possible but always in the related context.  
You can use maximum ${botConfig.mainAIMaxToken} tokens.
`.trim();

  console.log(systemPrompt);

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
