// services/imageEmbedding.ts
import axios from "axios";
import OpenAI from "openai";
import Tesseract from "tesseract.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// download image as buffer (no disk)
export async function downloadImageBuffer(url: string) {
  // FB private URLs sometimes require token appended
  const safeUrl =
    url.includes("scontent") &&
    process.env.PAGE_ACCESS_TOKEN &&
    !url.includes("access_token")
      ? `${url}${url.includes("?") ? "&" : "?"}access_token=${
          process.env.PAGE_ACCESS_TOKEN
        }`
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
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-large", // robust text embedding model
    input: text,
  });
  const emb = resp.data[0].embedding as number[];
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
  console.log("value", value);

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
  console.log("urls", urls);

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
