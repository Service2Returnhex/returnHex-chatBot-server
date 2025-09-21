import axios from "axios";
import { Jimp } from "jimp";
import OpenAI from "openai";
import Tesseract from "tesseract.js";

const GRAPH_MSG_URL = "https://graph.facebook.com/v23.0/me/messages";

// Create OpenAI client lazily to ensure env variables are loaded
// const getOpenAIClient = () => {
//   return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// };
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// console.log("image embedding env",openai);
export const UI_BLACKLIST = new Set([
  "yesterday",
  "like",
  "comment",
  "share",
  "boost",
  "post",
  "ago",
  "hour",
  "hours",
  "min",
  "minutes",
  "mins",
  "view",
  "views",
  "tour",
  "travel",
  "thour",
  "HOUR",
  "AGO",
  "all",
]);

// download image as buffer (no disk)
export async function downloadImageBuffer(url: string, access_token: string) {
  // FB private URLs sometimes require token appended
  const safeUrl =
    url.includes("scontent") && access_token && !url.includes("access_token")
      ? `${url}${url.includes("?") ? "&" : "?"}access_token=${access_token}`
      : url;

  const res = await axios.get(safeUrl, {
    responseType: "arraybuffer",
    timeout: 20000,
  });
  const ct = res.headers["content-type"] || "";
  if (!ct.startsWith("image/"))
    throw new Error("URL did not return an image; content-type: " + ct);
  return Buffer.from(res.data);
}

export function cleanText(text: string): string {
  if (!text) return "";
  let s = text.toString().toLowerCase();
  // remove URLs, emojis, lots of punctuation
  s = s.replace(/https?:\/\/\S+/g, " ");
  s = s.replace(/[^a-z0-9\s]/g, " ");
  // remove numbers (optionally keep price separately)
  s = s.replace(/\b\d+\b/g, " ");
  // collapse spaces
  s = s.replace(/\s+/g, " ").trim();
  // remove UI words
  const toks = s.split(" ").filter((t) => t && !UI_BLACKLIST.has(t));
  return toks.join(" ");
}

export function cleanTokens(s: string): string[] {
  if (!s) return [];
  return s
    .toLowerCase()
    .replace(/\n/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && t.length >= 1);
}

export const longestConsecutiveMatchRatio = async (
  pattern: string[],
  text: string[]
) => {
  if (!pattern.length || !text.length) return 0;
  let best = 0;
  for (let i = 0; i < text.length; i++) {
    let l = 0;
    for (let j = 0; j < pattern.length && i + j < text.length; j++) {
      if (text[i + j] === pattern[j]) l++;
      else break;
    }
    if (l > best) best = l;
  }
  return best / pattern.length; // 0..1
};

// helper to compute jaccard overlap
export const jaccard = async (a: string[], b: string[]) => {
  const A = new Set(a);
  const B = new Set(b);
  const inter = Array.from(A).filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size || 1;
  return inter / union;
};

// OCR with Tesseract (in-memory)
export async function extractTextFromImageBuffer(buffer: Buffer) {
  try {
    const worker = await Tesseract.createWorker(); // disable logs, optional
    await worker.load();
    await worker.load("eng");
    await worker.load("ben");
    await worker.reinitialize("eng+ben");
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    const txt = (data?.text || "").trim();
    return txt;
  } catch (err: any) {
    console.warn("OCR failed:", err?.message || err);
    return "";
  }
}

// Create OpenAI text embedding from text
export async function createTextEmbedding(text: string) {
  if (!text || text.trim().length === 0) return null;
  // const openai = getOpenAIClient();
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-large", // robust text embedding model
    input: text,
  });
  const emb = resp.data[0].embedding as number[];
  // console.log("emb", emb);
  return emb;
}

// cosine similarity
export function cosineSimilarity(a: number[], b: number[]) {
  if (!a || !b || a.length !== b.length) return -1;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return -1;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// average (mean) embeddings
export function averageEmbeddings(list: number[][]) {
  if (!list || list.length === 0) return [];
  const dim = list[0].length;
  const sum = new Array<number>(dim).fill(0);
  for (const v of list) {
    for (let i = 0; i < dim; i++) sum[i] += v[i] ?? 0;
  }
  return sum.map((s) => s / list.length);
}

// services/fbHelpers.ts
export function extractImageUrlsFromFeed(value: any): string[] {
  const urls: string[] = [];
  // console.log("value", value);

  // common single fields
  if (value.full_picture) urls.push(value.full_picture);
  if (value.picture) urls.push(value.picture);
  if (value.link && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(value.link))
    urls.push(value.link);

  if (Array.isArray(value.photos)) {
    for (const p of value.photos) if (typeof p === "string" && p) urls.push(p);
  }
  // some feeds may use "photo" singular or "images"
  if (Array.isArray(value.image) || Array.isArray(value.images)) {
    const arr = (value.image || value.images) as any[];
    for (const p of arr) if (p && typeof p === "string") urls.push(p);
  }
  if (value.photo && typeof value.photo === "string") urls.push(value.photo);

  // attachments structure: value.attachments?.data = [{media:{image:{src}}}, {subattachments:{data:[{media:{image:{src}}}]}}]
  const atts =
    value.attachments || value.attachment || value.subattachments || null;
  if (value.attachments?.data && Array.isArray(value.attachments.data)) {
    for (const a of value.attachments.data) {
      if (a.media?.image?.src) urls.push(a.media.image.src);
      if (a.media?.image?.url) urls.push(a.media.image.url);
      if (a.subattachments?.data) {
        for (const sa of a.subattachments.data) {
          if (sa.media?.image?.src) urls.push(sa.media.image.src);
        }
      }
      // sometimes payload.url exists
      if (a.payload?.url) urls.push(a.payload.url);
    }
  }
  // console.log("atts", value.attachments?.data);

  // some feeds provide 'attachments' as array directly
  if (Array.isArray(value.attachments)) {
    for (const a of value.attachments) {
      if (a.payload?.url) urls.push(a.payload.url);
      if (a.media?.image?.src) urls.push(a.media.image.src);
    }
  }

  // dedupe & filter empties
  return Array.from(new Set(urls.filter(Boolean)));
}

export async function extractImageCaptions(postData: any) {
  const results = [];
  const attachments =
    (postData && postData.attachments && postData.attachments.data) || [];

  for (const att of attachments) {
    if (att.subattachments && Array.isArray(att.subattachments.data)) {
      for (const sub of att.subattachments.data) {
        const url = sub.media?.image?.src || null;
        const caption = sub.description || sub.title || null;
        const photoId = sub.target?.id || null;
        results.push({ photoId, url, caption });
      }
    } else {
      // single attachment fallback
      const url = att.media?.image?.src || null;
      const caption = att.description || att.title || null;
      const photoId = att.target?.id || null;
      results.push({ photoId, url, caption });
    }
  }

  // if no attachment but message exists, optionally add a fallback record
  if (results.length === 0 && postData.message) {
    results.push({ photoId: null, url: null, caption: postData.message });
  }

  return results;
}

export async function computeHashFromBuffer(buffer: Buffer): Promise<string> {
  const img = await Jimp.read(buffer);
  img.resize({ w: 256, h: 256 }).greyscale();
  const hash = img.hash();
  // console.log("JimpModule keys:", Object.keys(JimpModule));
  // console.log(
  //   "JimpModule.default keys:",
  //   Object.keys((JimpModule as any).default || {})
  // ); // ex: "a1b2c3..."
  console.log("hash", hash);
  return hash as string;
}

export function hammingDistanceGeneric(a: string, b: string) {
  if (!a || !b) return Infinity;
  // normalize to lowercase
  a = a.toLowerCase();
  b = b.toLowerCase();

  // pad to same length
  if (a.length !== b.length) {
    const maxLen = Math.max(a.length, b.length);
    a = a.padStart(maxLen, "0");
    b = b.padStart(maxLen, "0");
  }

  // We'll parse each char as base36 (0-9a-z) which covers Jimp.hash outputs.
  // Each char -> value in [0..35] -> represent in 6 bits (6 bits can carry up to 64 values).
  const bitsPerChar = 6;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const ca = a[i];
    const cb = b[i];
    const va = parseInt(ca, 36); // returns NaN if impossible
    const vb = parseInt(cb, 36);
    // fallback: if parseInt fails, use charCode
    const vala = Number.isNaN(va) ? ca.charCodeAt(0) : va;
    const valb = Number.isNaN(vb) ? cb.charCodeAt(0) : vb;

    // XOR and count bits
    let x = vala ^ valb;
    // count set bits in x
    while (x) {
      dist += x & 1;
      x = x >>> 1;
    }
  }
  return dist;
}

export async function sendImageAttachment(
  recipientId: string,
  imageUrl: string,
  pageAccessToken: string
) {
  try {
    const body = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: "image",
          payload: { url: imageUrl, is_reusable: false },
        },
      },
    };
    await axios.post(GRAPH_MSG_URL, body, {
      params: { access_token: pageAccessToken },
      timeout: 10000,
    });
  } catch (err) {
    console.warn("sendImageAttachment failed:", (err as any)?.message || err);
    throw err;
  }
}

export function isAskingForImage(rawMsg: string | undefined | null): boolean {
  if (!rawMsg) return false;
  const s = rawMsg.toString().toLowerCase().trim();

  // সহজ কিওয়ার্ডগুলো — বাংলা ও ইংরেজি মিশানো
  const keywords = [
    "ছবি", "ইমেজ", "দেখ", "দেখাও", "দেখতে চাই", "দেখান", "দেও", "দাও", "দেন",
    "show image", "dau", "cobi", "show", "show photo", "picture", "photo", "open image", "open photo", "den", "patau"
  ];

  for (const k of keywords) {
    if (s.includes(k)) return true;
  }

  // আরও একটু জেনেরিক regex (বাংলা/ইংরেজি ছোট চেক)
  if (/\b(দেখ(তে)?\s*(চাই|পার|অন)|দেখাও|show|show me|please show)\b/i.test(s)) {
    return true;
  }

  return false;
}

export async function sendTyping(senderId: string, on = true) {
  // implement sender_action typing_on/off call
  console.log("[sendTyping]", senderId, on ? "on" : "off");
}
