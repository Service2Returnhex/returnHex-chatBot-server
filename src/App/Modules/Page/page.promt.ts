import OpenAI from "openai";
import { IChatMessages } from "../Chatgpt/chat-history.model";
import { IComments } from "../Chatgpt/comment-histroy.model";
import { IPageInfo } from "./pageInfo.model";
import { IPost } from "./post.mode";

function redactPII(text: string) {
  if (!text) return text;
  // redact emails
  let t = text.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    "[REDACTED_EMAIL]"
  );
  // redact phone-like sequences (simple)
  t = t.replace(/(\+?\d[\d\-\s]{6,}\d)/g, "[REDACTED_PHONE]");
  return t;
}

function localSummarizer(messages: IChatMessages[]) {
  if (!messages || messages.length === 0) return "No recent message...";
  const last = messages.slice(-12).reverse();
  const customized = last.map((m, i) => ({
    index: i + 1,
    role: m.role,
    original: m.content,
    customized:
      m.role === "user"
        ? m.content.replace(/\s+/g, " ").trim().slice(0, 120)
        : `Answered: ${m.content.split(".")[0].slice(0, 120)}`,
  }));
  const summary = customized
    .slice(0, 4)
    .map((c) => `${c.role}: ${c.customized}`)
    .join(" | ");
  const actions = [
    "Ask a clarifying question",
    "Request missing details",
    "Provide a concise answer",
  ];
  return {
    customizedMessages: customized,
    summary,
    actions,
    rawModelOutput: "",
  };
}

// summarizeRecentMessage
export const summarizeRecentMessage = async (
  messages: IChatMessages[]
): Promise<string> => {
  if (!messages || messages.length === 0) return "No recent messages.";

  let recentUserDMPromt = "";
  let cnt = 1;
  if (messages.length >= 10) {
    for (let i = messages.length - 1; i >= messages.length - 10; i--) {
      recentUserDMPromt += `${cnt} - role: ${messages[i].role}, content: ${messages[i].content},`;
      cnt++;
    }
  } else {
    messages.forEach((promts, idx) => {
      recentUserDMPromt += `${cnt} - role: ${promts.role}, content: ${promts.content},`;
      cnt++;
    });
  }

  const N = 10;
  const last = messages.slice(-N).reverse(); // newest first
  const safeItems = last.map((m, i) => ({
    idx: i + 1,
    role: m.role,
    content: redactPII(m.content).replace(/\s+/g, " ").trim().slice(0, 1200),
  }));
  const formatted = safeItems
    .map((s) => `${s.idx}. ${s.role.toUpperCase()}: ${s.content}`)
    .join("\n");

  const instruction = `
Below are the most recent ${safeItems.length} messages (newest first). Each line is "N. ROLE: TEXT".
Tasks:
1) For each line produce a "customized" short version suitable for including in a system prompt:
   - user: one-sentence intent
   - assistant: one short bullet describing what was answered
2) Provide 1-line summary of this window.
3) Provide up to 3 short action suggestions (one-line).
4) Output EXACTLY a JSON object with keys:
   { "customizedMessages": [ { "index":1, "role":"user", "original":"...", "customized":"..." }, ... ],
     "summary": "...",
     "actions": ["..."] 
   }
Output JSON only. No extra text.
  
Input:
${formatted}
`.trim();
  console.log("user Dm Prompt", instruction);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful summarizer assistant." },
      { role: "user", content: instruction },
    ],
  });

  const reply = completion.choices[0].message.content || "Something Went Wrong";
  // if (!reply) return localSummarizer(messages);
  return (reply as string).trim();
};

export const makePromtDM = async (
  page: IPageInfo,
  posts: IPost[],
  userPromts: IChatMessages[],
  options?: { summaryFromLLM?: boolean }
): Promise<string> => {
  let postList = "";

  if (posts.length > 0) {
    postList = posts
      .map(
        (p, i) => `
${i + 1}. ${p.message}`
      )
      .join(",");
  }

  // let recentUserDMPromt = "";
  // let cnt = 1;
  // if (userPromts.length >= 10) {
  //   for (let i = userPromts.length - 1; i >= userPromts.length - 10; i--) {
  //     recentUserDMPromt += `${cnt} - role: ${userPromts[i].role}, content: ${userPromts[i].content},`;
  //     cnt++;
  //   }
  // } else {
  //   userPromts.forEach((promts, idx) => {
  //     recentUserDMPromt += `${cnt} - role: ${promts.role}, content: ${promts.content},`;
  //     cnt++;
  //   });
  // }
  // const formatted = summarizeRecentMessage(recentUserDMPromt);

  // console.log("recent Dm Prompt", recentUserDMPromt);
  const useLLM = options?.summaryFromLLM ?? true;
  const recentSummary = useLLM
    ? await summarizeRecentMessage(userPromts || [])
    : localSummarizer(userPromts || []);

  const systemPrompt = `
You are an AI assistant for the Facebook page that manages users by answering DM questions about page info and posts.
Page information:
- PageName: ${page.pageName}
- Category: ${page.pageCategory ?? "N/A"}
- Address: ${page?.address ?? "N/A"}
- Phone: ${page?.phone ? "[REDACTED_PHONE]" : "N/A"}
- Email: ${page?.email ? "[REDACTED_EMAIL]" : "N/A"}
- MoreInfo: ${page?.moreInfo ?? "N/A"}

Recent posts:
${
  postList.length
    ? postList
    : "No posts available. Answer smartly about the page."
}

Customized recent messages summary (short):
${recentSummary}

Additional system instructions:
${page?.dmSystemPromt ?? ""}

Respond as a helpful, concise assistant. If user asks about items in the summary, use the context above. 
`.trim();

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
