import { IComments } from "../Chatgpt/comment-histroy.model";
import { IPageInfo, PageInfo } from "./pageInfo.model";
import { IPost } from "./post.mode";

export const makePromtDM = async (
  page: IPageInfo,
  posts: IPost[],
): Promise<string> => {
  let postList = "";

  if (posts.length > 0) {
    postList = posts
      .map(
        (p, i) => `
${i + 1}. ${!p.summarizedMsg ? p.message : p.summarizedMsg}`
      )
      .join(",");
  }

  const shopInfo = page.summary.length ? page.summary : `PageName: ${page.pageName}, Category: ${
    page.pageCategory ?? "N/A"
  }, Address: ${page?.address ?? "N/A"}
  Phone: ${page?.phone ? page.phone : "N/A"}, Email: ${
    page?.email ? page.email : "N/A"
  }, MoreInfo: ${page?.moreInfo ?? "N/A"}
  `;
  
  const systemPrompt = `
  Page information: ${shopInfo}

Recent posts(can be products, service etc category):
${
  postList.length > 0
    ? postList
    : "Say No posts(can be products, service etc category) available. if the list is empty"
}

more system instructions:
${page?.dmSystemPromt ?? "not provided"}

answer as short as possible but in related context(no extra, additonal and irrelevant things). 
You can use maximum 50 token
`.trim();

  console.log(systemPrompt)

  return systemPrompt;
};

export const makePromtComment = (
  page: IPageInfo,
  posts: IPost[],
  specificPost: any,
  userPromts: IComments[]
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

  let recentCmntPromt = "";
  let cnt = 1;
  if (userPromts.length >= 10) {
    for (let i = userPromts.length - 1; i >= userPromts.length - 10; i--) {
      recentCmntPromt += `${cnt} - role: ${userPromts[i].role}, content: ${userPromts[i].content},`;
      cnt++;
    }
  } else {
    userPromts.forEach((promts, idx) => {
      recentCmntPromt += `${cnt} - role: ${promts.role}, content: ${promts.content},`;
      cnt++;
    });
  }

  const systemPrompt = `
  You are an AI assistant for Facebook page that manages users by giving comment answer regarding page information
  and page posts and recent comments. Here is the page info: - PageName: ${
    page.pageName
  }
  - Category: ${page.pageCategory} - Address: ${page?.address} - Phone: ${
    page?.phone
  }
  - Email: ${page?.email} - MoreInfo: ${page?.moreInfo}.
  In case of comment replay first priority to say about commented post.
  Specific post details: ${
    specificPost
      ? `User Wants to know about this product in comment: - Product Name: ${specificPost.name}
  - Description: ${specificPost.description} - Price: ${specificPost.price}- MoreDetails: ${specificPost.message}`
      : ""
  } 
  Post Lists:
  ${
    postList.length
      ? "Then response about the posts" + postList
      : "No posts available. and answer smartly"
  }
  Recent Comments: ${recentCmntPromt}
  more promt: ${page?.cmntSystemPromt ? page.cmntSystemPromt : ""}  
  `.trim();

  return systemPrompt;
};
