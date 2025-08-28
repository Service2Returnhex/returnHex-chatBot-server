import OpenAI from "openai";
import { IChatMessages } from "../Chatgpt/chat-history.model";

function redactPII(text: string) {
  if (!text) return text;
  let t = text.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    "[REDACTED_EMAIL]"
  );
  t = t.replace(/(\+?\d[\d\-\s]{6,}\d)/g, "[REDACTED_PHONE]");
  return t;
}

export function localDmSummarizer(messages: IChatMessages[]) {
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
export const summarizeRecentDmMessage = async (
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

  // const N = 10;
  // const last = messages.slice(-N).reverse(); // newest first
  // const safeItems = last.map((m, i) => ({
  //   idx: i + 1,
  //   role: m.role,
  //   content: m.content.replace(/\s+/g, " ").trim().slice(0, 1200),
  //   original: m.content,
  // }));
  // const formatted = safeItems
  //   .map((s) => `${s.idx}. ${s.role.toUpperCase()}: ${s.content}`)
  //   .join("\n");

  const instruction = `
Below are the most recent ${recentUserDMPromt.length} messages (newest first). Each line is "N. ROLE: TEXT".
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
${recentUserDMPromt}
`.trim();

  console.log("user Dm Prompt", instruction);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "You are a helpful summarizer assistant." },
      { role: "user", content: instruction },
    ],
  });

  const reply = completion.choices[0].message.content || "Something Went Wrong";
  // if (!reply) return localSummarizer(messages);
  return (reply as string).trim();
};

export function localCmtSummarizer(messages: IChatMessages[]) {
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
export const summarizeRecentCmtMessage = async (
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
    content: m.content.replace(/\s+/g, " ").trim().slice(0, 1200),
    original: m.content,
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
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: "You are a helpful summarizer assistant." },
      { role: "user", content: instruction },
    ],
  });

  const reply = completion.choices[0].message.content || "Something Went Wrong";
  // if (!reply) return localSummarizer(messages);
  return (reply as string).trim();
};
