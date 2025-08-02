export const makePromtDM = (
  page: any,
  posts: any[],
  prompt: string
): string => {
  let postList = "";

  if (posts.length > 0) {
    postList = posts
      .map(
        (p, i) => `
${i + 1}. ${p.message}`
      )
      .join(",");
  }

  console.log("product list: " + postList);

  const systemPrompt = `
  You are an AI assistant for multiple Facebook page that sells products. Here is the shop info: - PageName: ${page.pageName}
  - Category: ${page.pageCategory} - Address: ${page?.address} - Phone: ${page?.phone}  
Available Products:
${postList || "দুঃখিত, এখন কোনো পণ্য তালিকাভুক্ত নেই।"}
  always try replies very short and helpful (max 30 tokens if possible).
  - Only answer questions related to the shop or its products.
 - For anything else, respond politely: "Sorry, I can only help with our shop and products."
  `.trim();

  return systemPrompt;
};

export const makePromtComment = (
  page: any,
  posts: any[],
  specificPost: any
): string => {
  let postList = "";

  if (posts.length > 0) {
    postList = posts
      .map(
        (p, i) => `
${i + 1}. ${p.message}`
      )
      .join(",");
  }

  const systemPrompt = `
  You are an AI assistant for a Facebook page that sells products. Here is the shop info: - PageName: ${
    page.pageName
  }
  - Category: ${page.pageCategory} - Address: ${page?.address} - Phone: ${
    page?.phone
  }
  in case of comment replay first priority to say about commented post
  specific post details: ${
    specificPost
      ? `User Wants to know about this product in comment: - Product Name: ${specificPost.name}
  - Description: ${specificPost.description} - Price: ${specificPost.price}- MoreDetails: ${specificPost.message}`
      : ""
  } 

  here is the product list:  ${postList}, say no product's if empty
  always try to answer in minimun token's maximum 30 token's if possible.
  Any onther topic execpt this, say sorry.  
  `.trim();

  return systemPrompt;
};
