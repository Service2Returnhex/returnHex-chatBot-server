// phash-helpers.ts
import axios from "axios";
import { Jimp } from "jimp";
// import * as JimpModule from "jimp";

// const Jimp: any = (JimpModule as any).default || JimpModule;

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || ""; // optional FB token
export const HAMMING_THRESHOLD = 16; // টিউন করুন: 0 strict, 8-15 relaxed

export async function downloadImageBuffer(url: string) {
  // FB lookaside URLs কখনো প্রাইভেট হতে পারে: token append করার অপশন
  const safeUrl =
    PAGE_ACCESS_TOKEN &&
    url.includes("scontent") &&
    !url.includes("access_token")
      ? `${url}${
          url.includes("?") ? "&" : "?"
        }access_token=${PAGE_ACCESS_TOKEN}`
      : url;

  const res = await axios.get(safeUrl, {
    responseType: "arraybuffer",
    timeout: 20000,
  });
  const contentType = res.headers["content-type"] || "";
  if (!contentType.startsWith("image/"))
    throw new Error(`URL did not return image (content-type: ${contentType})`);
  return Buffer.from(res.data);
}

export async function computeHashFromBuffer(buffer: Buffer): Promise<string> {
  const img = await Jimp.read(buffer);
  const hash = img.hash();
  // console.log("JimpModule keys:", Object.keys(JimpModule));
  // console.log(
  //   "JimpModule.default keys:",
  //   Object.keys((JimpModule as any).default || {})
  // ); // ex: "a1b2c3..."
  console.log("hash", hash);
  return hash as string;
}
export async function sendTyping(senderId: string, on = true) {
  // implement sender_action typing_on/off call
  console.log("[sendTyping]", senderId, on ? "on" : "off");
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
