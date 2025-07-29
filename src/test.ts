// const str = "708889365641067_122106535610937984";
// const postId = str.split("_")[1];
// console.log(postId); // Output: 122106535610937984




const webHookOnPostLikeThis = {
  "object": "page",
  "entry": [
    {
      "id": "708889365641067",
      "time": 1721222210,
      "changes": [
        {
          "field": "feed",
          "value": {
            "item": "status",
            "verb": "add",
            "post_id": "708889365641067_122106535610937984",
            "message": "🔥 New arrival! Check out our latest RGB mouse at only 1300 BDT!",
            "created_time": 1721222210
          }
        }
      ]
    }
  ]
}





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


