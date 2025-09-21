// server/utils/sanitizeAndEnrichImages.ts
import { computeHashFromBuffer, createTextEmbedding, downloadImageBuffer, extractTextFromImageBuffer } from "./image.embedding";
 // adjust relative path if needed

type ImgIn = { url: string; caption?: string; embedding?: number[]; phash?: string };
type ImgOut = { url: string; caption: string; embedding: number[]; phash: string };
async function asyncPool<T, R>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T, index: number, array: T[]) => Promise<R>
): Promise<R[]> {
  const ret: R[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < array.length; i++) {
    const p = (async () => {
      const res = await iteratorFn(array[i], i, array);
      ret[i] = res;
    })();

    executing.push(p);

    if (executing.length >= poolLimit) {
      // wait for the earliest promise to finish
      await Promise.race(executing);
      // remove fulfilled promises
      for (let j = executing.length - 1; j >= 0; j--) {
        if ((executing[j] as any).resolved) {
          executing.splice(j, 1);
        }
      }
      // Note: we mark resolved promises below using a wrapper to set .resolved
    }
    // Wrap p so we can find when it's done by marking .resolved
    (p as any).then(() => ((p as any).resolved = true)).catch(() => ((p as any).resolved = true));
  }

  // wait for the rest
  await Promise.all(executing);
  return ret;
}

export async function sanitizeAndEnrichImages(
  maybe: any,
  fallbackFullPicture?: string,
  options?: {
    accessToken?: string;
    concurrency?: number;
    computeEmbedding?: boolean;
    computePhash?: boolean;
  }
): Promise<ImgOut[]> {
  const { accessToken, concurrency = 4, computeEmbedding = true, computePhash = true } = options || {};

  console.log("accesstoken",accessToken);
  // Normalize input to array
  let incoming: any[] = [];
  if (Array.isArray(maybe)) incoming = maybe;
  else if (maybe && typeof maybe === "object") incoming = [maybe];
  else incoming = [];

  if (incoming.length === 0 && fallbackFullPicture) incoming = [{ url: fallbackFullPicture }];

  const sanitized = incoming
    .map((img: any) => ({
      url: img?.url ? String(img.url).trim() : "",
      caption: img?.caption ? String(img.caption) : "",
      embedding: Array.isArray(img?.embedding) && img.embedding.length ? img.embedding : undefined,
      phash: img?.phash ? String(img.phash) : undefined,
    }))
    .filter((i) => i.url);

  if (sanitized.length === 0) return [];

  

 async function processImage(img: any): Promise<ImgOut> {
    const out: ImgOut = {
      url: img.url,
      caption: img.caption || "",
      embedding: Array.isArray(img.embedding) ? img.embedding : [],
      phash: img.phash || "",
    };

    // phash
    if (computePhash && (!out.phash || out.phash.length === 0)) {
      try {
        const buf = await downloadImageBuffer(out.url, accessToken ?? "");
        const ph = await computeHashFromBuffer(buf);
        out.phash = ph || "";
      } catch (e) {
        console.warn("phash failed for", out.url, (e as any)?.message || e);
        out.phash = out.phash || "";
      }
    }

    // embedding (OCR -> text embedding)
    if (computeEmbedding && (!Array.isArray(out.embedding) || out.embedding.length === 0)) {
      try {
        const buf = await downloadImageBuffer(out.url, accessToken ?? "");
        let ocrText = "";
        try {
          ocrText = (await extractTextFromImageBuffer(buf)) || "";
        } catch (ocrErr) {
          ocrText = "";
        }
        const textForEmbedding = ocrText && ocrText.trim().length > 0 ? ocrText : (out.caption || out.url);
        if (textForEmbedding) {
          const emb = await createTextEmbedding(textForEmbedding);
          out.embedding = Array.isArray(emb) ? emb : [];
        } else {
          out.embedding = [];
        }
      } catch (e) {
        console.warn("embedding failed for", out.url, (e as any)?.message || e);
        out.embedding = out.embedding || [];
      }
    }

    out.phash = out.phash || "";
    out.embedding = Array.isArray(out.embedding) ? out.embedding : [];

    return out;
  }

  // Use asyncPool for concurrency control
  const results = await asyncPool(concurrency, sanitized, async (it) => {
    return await processImage(it);
  });

  return results;
}
