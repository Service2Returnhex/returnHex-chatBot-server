import { IPageInfo } from "./pageInfo.model";
import { IPost } from "./post.mode";

export const makePromtDM = (
  page: IPageInfo,
  posts: IPost[],
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

  const systemPrompt = `
  You are an AI assistant for Facebook page that manages users by giving dm answer regarding page information
  and page posts. Here is the page info: - PageName: ${page.pageName}
  - Category: ${page.pageCategory} - Address: ${page?.address} - Phone: ${page?.phone}
  - Email: ${page?.email} - MoreInfo: ${page?.moreInfo} 
  Post Lists:
  ${postList.length ? "Then response about the posts" + postList : "No posts available. and answer smartly"}
  more promt: ${page?.dmSystemPromt ? page.dmSystemPromt : ""}
  `.trim();
  return systemPrompt;
};

export const makePromtComment = (
  page: IPageInfo,
  posts: IPost[],
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
  You are an AI assistant for Facebook page that manages users by giving comment answer regarding page information
  and page posts. Here is the page info: - PageName: ${page.pageName}
  - Category: ${page.pageCategory} - Address: ${page?.address} - Phone: ${page?.phone}
  - Email: ${page?.email} - MoreInfo: ${page?.moreInfo}.
  In case of comment replay first priority to say about commented post.
  Specific post details: ${
    specificPost
      ? `User Wants to know about this product in comment: - Product Name: ${specificPost.name}
  - Description: ${specificPost.description} - Price: ${specificPost.price}- MoreDetails: ${specificPost.message}`
      : ""
  } 
  Post Lists:
  ${postList.length ? "Then response about the posts" + postList : "No posts available. and answer smartly"}
  more promt: ${page?.cmntSystemPromt ? page.cmntSystemPromt : ""}  
  `.trim();

  return systemPrompt;
};
