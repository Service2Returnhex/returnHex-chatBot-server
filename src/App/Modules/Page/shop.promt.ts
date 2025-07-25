export const makePromtDM = (
    shop: any,
    products: any[],
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
    
      ${
        products.length > 0
          ? `list the product's what user wants smartly. Here is our product list: ${productList}
      if the product list's Description and Price part is missing try to find post details from MoreDetails`
          : ""
      }
      Respond to the user's message helpfully and naturally using the above context.
      `.trim();

    
    return systemPrompt
}

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

    return systemPrompt
}