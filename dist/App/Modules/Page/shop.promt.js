"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePromtComment = exports.makePromtDM = void 0;
const makePromtDM = (shop, products, prompt) => {
    console.log("Coming here!");
    let productList = "";
    if (products.length > 0) {
        productList = products
            .map((p, i) => `
${i + 1}. ${p.message}`)
            .join(",");
    }
    console.log("product list: " + productList);
    const systemPrompt = `
  You are an AI assistant for a Facebook page that sells products. Here is the shop info: - PageName: ${shop.pageName}
  - Category: ${shop.pageCategory} - Address: ${shop === null || shop === void 0 ? void 0 : shop.address} - Phone: ${shop === null || shop === void 0 ? void 0 : shop.phone}  
  here is the product list:
  ${productList} say no product's if empty
  always try to answer in minimun token's maximum 30 token's if possible. 
  `.trim();
    return systemPrompt;
};
exports.makePromtDM = makePromtDM;
const makePromtComment = (shop, products, specificProduct) => {
    let productList = "";
    if (products.length > 0) {
        productList = products
            .map((p, i) => `
${i + 1}. ${p.message}`)
            .join(",");
    }
    const systemPrompt = `
  You are an AI assistant for a Facebook page that sells products. Here is the shop info: - PageName: ${shop.pageName}
  - Category: ${shop.pageCategory} - Address: ${shop === null || shop === void 0 ? void 0 : shop.address} - Phone: ${shop === null || shop === void 0 ? void 0 : shop.phone}
  in case of comment replay first priority to say about commented post
  specific post details: ${specificProduct ? `User Wants to know about this product in comment: - Product Name: ${specificProduct.name}
  - Description: ${specificProduct.description} - Price: ${specificProduct.price}- MoreDetails: ${specificProduct.message}`
        : ""} 

  here is the product list:  ${productList}, say no product's if empty
  always try to answer in minimun token's maximum 30 token's if possible.  
  `.trim();
    return systemPrompt;
};
exports.makePromtComment = makePromtComment;
