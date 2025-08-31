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
    await worker.load("eng"); // install English
    await worker.load("ben"); // install Bengali if available
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
