import { keywords } from "./shop.keywords";

export const makePromtDM = (
  shop: any,
  products: any[],
  prompt: string
): string => {
  const lowerPrompt = prompt.toLowerCase();

  const shopNameKeywords = keywords.shopNameKeywords
  const shopAddressKeywords = keywords.shopAddressesKeywords
  const shopPhoneKeywords = keywords.shopPhoneKeyword
  const shopCategoryKeywords = keywords.shopCategoryKeywords
  const shopAllShopInfoKeyWords = keywords.shopAllInfoKeywords

  const shopAllProductKeywords = keywords.shopAllProductKeyword


  const includesKeyword = (keywords: string[]) =>
    keywords.some((word) => lowerPrompt.includes(word));

  let shopInfoParts: string[] = [];
  if (includesKeyword(shopAllShopInfoKeyWords)) {
    shopInfoParts.push(`Name: ${shop.pageName}`);
    shopInfoParts.push(`Category: ${shop.pageCategory}`);
    shopInfoParts.push(`Address: ${shop.address}`);
    shopInfoParts.push(`Phone: ${shop.phone}`);
  } else {
    if (includesKeyword(shopNameKeywords)) {
      shopInfoParts.push(`Name: ${shop.pageName}`);
    }
    if (includesKeyword(shopCategoryKeywords)) {
      shopInfoParts.push(`Category: ${shop.pageCategory}`);
    }
    if (includesKeyword(shopAddressKeywords)) {
      shopInfoParts.push(`Address: ${shop.address}`);
    }
    if (includesKeyword(shopPhoneKeywords)) {
      shopInfoParts.push(`Phone: ${shop.phone}`);
    }
  }

  const finalShopInfo =
    shopInfoParts.length > 0 ? `Shop Info: ${shopInfoParts.join(", ")}.` : "";

  const isAskingForAllProducts = includesKeyword(shopAllProductKeywords);

  const matchedProducts = products.filter((p) =>
    lowerPrompt.includes(p.message.toLowerCase())
  );

  let productList = "";

  if (isAskingForAllProducts) {
    console.log("Comming form All Product's query");
    productList = products
      .map((p, i) => `${i + 1}. Details: ${p.message}`)
      .join("\n");
  } else if (matchedProducts.length > 0) {
    console.log("Comming form specific product query");
    console.log(matchedProducts);
    productList = matchedProducts
      .map((p, i) => `${i + 1}. Details: ${p.message}`)
      .join("\n");
  } else if (products.length > 0) {
    productList = "Sorry, no product found matching your query.";
  }

  const systemPrompt = `
  You are a smart and friendly AI assistant for a Facebook shop.

  Shop Info:
  ${finalShopInfo}

  Product List:
  ${productList}

  Respond in a natural, concise, and helpful tone using this context.
  Always try to answer in minimum token, and maximum 30 if possible.
`.trim();

  return systemPrompt;
};

export const makePromtComment = (
  shop: any,
  products: any[],
  specificProduct: any
): string => {
  let productList = "";

  if (products.length > 0) {
    productList = products
      .map(
        (p, i) => `
${i + 1}. ${p.name}
   - Description: ${p.description}
   - Price: ${p.price}
   - createdAt: ${p.createdAt}
   - MoreDetails: ${p.message}`
      )
      .join("\n\n");
  }

  const systemPrompt = `
  You are an AI assistant for a Facebook page that sells products.

  Here is the shop info:
  - PageName: ${shop.pageName}
  - Category: ${shop.pageCategory}
  - Address: ${shop?.address}
  - Phone: ${shop?.phone}

  in case of comment reply, your first priority will be to reply about commented
  post deatails and product details if user asks about it. If it's not present
  then reply tell about the product list smartly.
  
  here is the specific post details:
  ${
    specificProduct
      ? `User Wants to know about this product either in comment:
  - Product Name: ${specificProduct.name}
  - Description: ${specificProduct.description}
  - Price: ${specificProduct.price}
  - MoreDetails: ${specificProduct.message}`
      : ""
  }

  here is the product list:
  ${
    products.length > 0
      ? `list the product's what user wants smartly. Here is our product list: ${productList}
  if the product list's Description and Price part is missing try to find post details from MoreDetails`
      : ""
  }
  Respond to the user's message helpfully and naturally using the above context.
  `.trim();

  return systemPrompt;
};
