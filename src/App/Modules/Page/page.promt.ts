import { botConfig } from "../../config/botConfig";
import { IPageInfo } from "./pageInfo.model";
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
You can use maximum ${botConfig.mainAIMaxToken} token
`.trim();

  console.log(systemPrompt)

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
      ? (postList += `\n visite our page for ${
          posts.length - recentPost.length
        } more(can be products, service etc page category)...`)
      : "";
  }

  const shopInfo = page.summary.length
    ? page.summary
    : `PageName: ${page.pageName}, Category: ${
        page.pageCategory ?? "N/A"
      }, Address: ${page?.address ?? "N/A"}
  Phone: ${page?.phone ? page.phone : "N/A"}, Email: ${
        page?.email ? page.email : "N/A"
      }, MoreInfo: ${page?.moreInfo ?? "N/A"}
  `;

  const systemPrompt = `
  Page information: ${shopInfo}
  In case of comment replay first priority to say about commented post.
  commented post details: ${
    specificPost
      ? `User Wants to know about this post in comment- Details: ${specificPost.message}`
      : ""
  } 
  Recent posts(can be products, service etc page category): ${
    postList.length > 0 ? postList : ""
  }
  more system instructions: ${page?.cmntSystemPromt ? page.cmntSystemPromt : ""}
  
  answer as short as possible but in related context(no extra, additonal and irrelevant things). 
  You can use maximum ${botConfig.mainAIMaxToken} token
  `.trim();

  return systemPrompt;
};
