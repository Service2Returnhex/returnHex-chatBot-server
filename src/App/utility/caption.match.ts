import { sendMessage } from "../api/facebook.api";
import {
  cleanTokens,
  jaccard,
  longestConsecutiveMatchRatio,
  sendImageAttachment,
  UI_BLACKLIST,
} from "./image.embedding";

export type CaptionItem = {
  postId?: string;
  imageUrl?: string;
  imageCaption?: string | null;
  message?: string | null;
  createdAt?: string | number | Date;
  [k: string]: any;
};
function normalize(s?: string) {
  return (s || "").toString().trim().toLowerCase();
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function pickBestCaptionSimple(
  captionMatch: CaptionItem[],
  uniqueOrdered: string[],
  shopId: string,
  senderId: string,
  pageAccessToken: string
) {
  if (captionMatch && captionMatch.length > 0) {
    const cleanedPhraseTokens = uniqueOrdered;

    let best: { item: any; score: number } | null = null;
    let chosen;

    for (const item of captionMatch) {
      const captionRaw: string = (
        item.imageCaption ||
        item.message ||
        ""
      ).toString();
      const capTokens = cleanTokens(captionRaw).filter(
        (t) => t && !UI_BLACKLIST.has(t)
      );
      //  const toks = s.split(" ").filter((t) => t && !UI_BLACKLIST.has(t));

      let score = 0;

      // 1) exact ordered phrase match -> big boost
      if (cleanedPhraseTokens.length > 0) {
        const orderedPhraseRegex = new RegExp(
          "\\b" + escapeRegex(cleanedPhraseTokens.join("\\s+")) + "\\b",
          "i"
        );
        if (orderedPhraseRegex.test(captionRaw)) {
          score += 2.0;
        }
      }

      // 2) token overlap (jaccard)
      const jac = await jaccard(cleanedPhraseTokens, capTokens); // 0..1
      score += jac;

      const lratio = await longestConsecutiveMatchRatio(
        cleanedPhraseTokens,
        capTokens
      );
      console.log("score", score);
      console.log("lratio", lratio);
      score += lratio * 0.5;

      const MIN_SCORE = 0.09;
      if (best === null || score > best.score) {
        // only accept if the new score passes threshold
        if (score > MIN_SCORE) {
          best = { item, score };
          chosen = item;
        }
      }
    }

    console.log(
      "Best caption candidate score:",
      best?.score,
        "chosen postId:",
        chosen?.postId
    );

    if (chosen && chosen.imageUrl) {
      console.log("img url",chosen.imageUrl);
      try {
        await sendImageAttachment(senderId, chosen.imageUrl, pageAccessToken);
      } catch (err) {
        console.warn(
          "sendImageAttachment failed img:",
          (err as any)?.message || err
        );
      }
      await sendMessage(
        senderId,
        shopId,
        (chosen.imageCaption || chosen.message || "").toString()
      );
      return;
    }
    return;
    //  else {
    //   // fallback to first element if something weird
    //   const m = captionMatch[0];
    //   if (m && m.imageUrl) {
    //     try {
    //       await sendImageAttachment(senderId, m.imageUrl, pageAccessToken);
    //     } catch (err) {
    //       console.warn(
    //         "sendImageAttachment failed:",
    //         (err as any)?.message || err
    //       );
    //     }
    //     await sendMessage(
    //       senderId,
    //       shopId,
    //       (m.imageCaption || m.message || "").toString()
    //     );
    //     return;
    //   }
    // }
  }
  return
}
