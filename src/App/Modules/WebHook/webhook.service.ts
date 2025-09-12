import { AxiosError } from "axios";
import { Request, Response } from "express";
import { replyToComment, sendMessage } from "../../api/facebook.api";
import { AIMethod, getAiReplySimple } from "../../utility/aiSimple";
import { fetchPostAttachments } from "../../utility/image.caption";
import {
  averageEmbeddings,
  cleanText,
  cleanTokens,
  computeHashFromBuffer,
  cosineSimilarity,
  createTextEmbedding,
  downloadImageBuffer,
  extractImageCaptions,
  extractImageUrlsFromFeed,
  extractTextFromImageBuffer,
  hammingDistanceGeneric,
  jaccard,
  longestConsecutiveMatchRatio,
  sendImageAttachment,
  sendTyping,
  UI_BLACKLIST,
} from "../../utility/image.embedding";
import { ChatgptService } from "../Chatgpt/chatgpt.service";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { DeepSeekService } from "../DeepSeek/deepseek.service";
import { GeminiService } from "../Gemini/gemini.service";
import { GroqService } from "../Groq/grok.service";
import { PageService } from "../Page/page.service";
import { PageInfo } from "../Page/pageInfo.model";
import { Post } from "../Page/post.mode";

enum ActionType {
  DM = "reply",
  COMMENT = "comment",
}

const SIMILARITY_THRESHOLD = 0.7;
const PHASH_HAMMING_THRESHOLD = 16;

// normalize and regex escape helpers
function normalize(s?: string) {
  return (s || "").toString().trim().toLowerCase();
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const handleDM = async (
  event: any,
  shopId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  const senderId = event.sender?.id;
  if (!senderId) return;
  if (event.message?.is_echo) return;
  const shop = await PageInfo.findOne({ shopId });
  const pageAccessToken = shop?.accessToken || "";

  const userMsg = (event.message?.text || "").toString();
  console.log("💬 DM Message:", userMsg);

  // --------------------------
  // If there's an attachment (image) -> image matching flow
  // --------------------------
  if (event.message?.attachments && event.message.attachments.length > 0) {
    const att = event.message.attachments[0];
    const imageUrl = att.payload?.url;
    console.log("imgurl==", imageUrl);
    if (!imageUrl) {
      await sendMessage(
        senderId,
        shopId,
        "ইমেজ URL পাওয়া যায়নি — আবার পাঠান দয়া করে।"
      );
      return;
    }

    try {
      await sendTyping(senderId, true);

      // 1) OCR -> user embedding
      const buf = await downloadImageBuffer(imageUrl, pageAccessToken);

      let ocrText = "";
      try {
        ocrText = (await extractTextFromImageBuffer(buf)) || "";
      } catch (ocrErr) {
        console.warn("OCR failed:", (ocrErr as any)?.message || ocrErr);
        ocrText = "";
      }
      let userText = (ocrText || "").trim();
      userText = cleanText(userText);
      console.log("userText", userText);

      const exact4All = Array.from(
        new Set(
          userText
            .split(/\s+/)
            .map((t) => t.replace(/[^a-zA-Z]/g, ""))
            .filter((t) => t.length >= 3)
        )
      );

      console.log("exact4All", exact4All);
      // const first4 = exact4Words.length > 0 ? exact4Words[0] : null;
      const uniqueOrdered = exact4All.filter(
        (w, i, arr) => arr.indexOf(w) === i
      );
      console.log("uniqueOrdered", uniqueOrdered);

      let phrase = "";
      phrase = uniqueOrdered.join(" ").trim();
      console.log("phrase:", phrase);

      // let captionRegex: RegExp | null = null;
      const captionRegex = new RegExp(uniqueOrdered.join("|"), "i");

      try {
        if (captionRegex) {
          const captionMatch = await Post.aggregate([
            { $match: { shopId } },
            { $unwind: "$images" },
            { $match: { "images.caption": { $regex: captionRegex } } },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                postId: 1,
                message: 1,
                createdAt: 1,
                imageUrl: "$images.url",
                imageCaption: "$images.caption",
                imagePhotoId: "$images.photoId",
                postLink: 1,
              },
            },
            { $limit: 10 }, // return up to 4 best recent items
          ]).exec();
          console.log("captionMatch", captionMatch);

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
                   "sendImageAttachment failed why:",
                   (err as any)?.message || err
                 );
               }
              //  await sendMessage(
              //    senderId,
              //    shopId,
              //    (chosen.imageCaption || chosen.message || "").toString()
              //  );
const userPrompt = `
A customer has submitted an image and requests information.
Use the data below:
Matched Product: ${(chosen.imageCaption || chosen.message || "").toString() || "(no caption)"}

Task:
1) First, confirm whether the customer is asking about the product identified by the matched caption: "${(chosen.imageCaption || chosen.message || "").toString()}".
2) State the product name/title based on the matched caption.
3) If a price is available in the provided data, include it.
4) Ask the customer a simple, direct question: "Would you like to purchase this item?"
5) If any required information (price, size, availability) is missing, offer a short alternative: "Would you like more details our team contact with you?"
6) Keep the response concise, professional, and friendly — no more than 3–4 short sentences.
`;
const systemInstruction="You are a professional customer support assistant. Use only the provided data; do not invent product details, prices, availability, or delivery information."

        
  
    //  let aiReply = "";
     const msgForAI = `${systemInstruction}\n\n${userPrompt}`;
     const fallbackOrder: AIMethod[] = ["gemini", "deepseek", "groq", "chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, msgForAI, ActionType.DM, fallbackOrder);
  
     try {
    if (aiReply && aiReply.trim().length > 0) {
      await sendMessage(senderId, shopId, aiReply);
    } else {
      // fallback human-friendly message
      await sendMessage(
        senderId,
        shopId,
        "দুঃখিত — পণ্যের সঠিক বিবরণ পাওয়া যায়নি। আপনি চান আমি একজন এজেন্টের সাথে সংযুক্ত করি?"
      );
    }
  } catch (err: any) {
    console.warn("sendMessage failed:", err?.message || err);
  }

               return;
             }
             
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
        }

        // quary with hash
        let incomingPhash: string | null = null;
        try {
          incomingPhash = await computeHashFromBuffer(buf);
        } catch (e) {
          console.warn(
            "computePHashFromBuffer failed:",
            (e as any)?.message || e
          );
          incomingPhash = null;
        }

        if (incomingPhash) {
          // NOTE: for large data you should query a dedicated images collection. For starters we scan posts.
          const posts = await Post.find({ shopId }).lean().exec();
          let bestPhash: { post: any; image: any; dist: number } | null = null;
          for (const post of posts) {
            for (const img of Array.isArray(post?.images) ? post.images : []) {
              if (!img?.phash) continue;
              const dist = hammingDistanceGeneric(incomingPhash, img.phash);
              if (!bestPhash || dist < bestPhash.dist)
                bestPhash = { post, image: img, dist };
            }
          }

          if (bestPhash && bestPhash.dist <= PHASH_HAMMING_THRESHOLD) {
            // strong visual match -> reply with that image's caption (prefered) + image
            const caption =
              bestPhash.image.caption ||
              bestPhash.post.message ||
              "(No caption)";
            // await sendMessage(senderId, shopId, caption.toString());
            // send image (optional)
            try {
              await sendImageAttachment(
                senderId,
                bestPhash.image.url,
                pageAccessToken
              );

              const userPrompt = `
A customer has ask for product information.
Use the data below:
Matched Product: ${(caption  || "").toString() || "(no caption)"}

Task:
1) First, confirm whether the customer is asking about the product identified by the matched caption: "${(caption || "").toString()}".
2) State the product name/title based on the matched caption.
3) If a price is available in the provided data, include it.
4) Ask the customer a simple, direct question: "Would you like to purchase this item?"
5) If any required information (price, size, availability) is missing, offer a short alternative: "Would you like more details our team contact with you?"
6) Keep the response concise, professional, and friendly — no more than 3–4 short sentences.
`;
const systemInstruction="You are a professional customer support assistant. Use only the provided data; do not invent product details, prices, availability, or delivery information."

        
console.log("caption",caption);
  
    //  let aiReply = "";
     const msgForAI = `${systemInstruction}\n\n${userPrompt}`;
     const fallbackOrder: AIMethod[] = ["gemini", "deepseek", "groq", "chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, msgForAI, ActionType.DM, fallbackOrder);
  console.log("aireply",aiReply);
     try {
    if (aiReply && aiReply.trim().length > 0) {
      await sendMessage(senderId, shopId, aiReply);
    } else {
      // fallback human-friendly message
      await sendMessage(
        senderId,
        shopId,
        "দুঃখিত — পণ্যের সঠিক বিবরণ পাওয়া যায়নি। আপনি চান আমি একজন এজেন্টের সাথে সংযুক্ত করি?"
      );
    }
  } catch (err: any) {
    console.warn("sendMessage failed:", err?.message || err);
  }
            } catch (err) {
              console.warn(
                "sendImageAttachment error:",
                (err as any)?.message || err
              );
            }
            return;
          }
        }

        // If none, try post-level text search ($text or regex)
        let postMatch: any[] = [];
        try {
          if (phrase && phrase.length > 2) {
            // $text search uses plain phrase (ensure you have text index on message or caption fields)
            postMatch = await Post.find(
              { shopId, $text: { $search: phrase } },
              { score: { $meta: "textScore" } } as any
            )
              .sort({ score: { $meta: "textScore" }, createdAt: -1 })
              .limit(4)
              .lean()
              .exec();
          } else {
            // build OR regex from first few words
            const orWords = uniqueOrdered
              .slice(0, 6)
              .map(escapeRegex)
              .filter(Boolean);
            if (orWords.length) {
              const msgRegex = new RegExp(
                "\\b(?:" + orWords.join("|") + ")\\b",
                "i"
              );
              postMatch = await Post.find({
                shopId,
                message: { $regex: msgRegex },
              })
                .sort({ createdAt: -1 })
                .limit(4)
                .lean()
                .exec();
            } else {
              postMatch = [];
            }
          }
        } catch (e) {
          console.warn(
            "post-level text search failed:",
            (e as any)?.message || e
          );
          postMatch = [];
        }

        if (postMatch && postMatch.length > 0) {
          // reply with first post's first image (if exists) and message
          const p = postMatch[0];
          const firstImg = p.images && p.images.length ? p.images[0].url : null;
          if (firstImg) {
            await sendImageAttachment(senderId, firstImg, pageAccessToken);
            await sendMessage(
              senderId,
              shopId,
              (p.images?.[0]?.caption || p.message || "").toString()
            );
            return;
          } else {
            // just send post message if no image
            await sendMessage(
              senderId,
              shopId,
              (p.message || "পোস্ট পাওয়া গেল").toString()
            );
            return;
          }
        }

        // If still nothing, fallback to AI conversational reply
        // let aiReply = "";
        const fallbackOrder: AIMethod[] = ["gemini", "deepseek", "groq", "chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, userMsg, ActionType.DM, fallbackOrder);

        if (aiReply) {
          await sendMessage(senderId, shopId, aiReply);
        } else {
          await sendMessage(
            senderId,
            shopId,
            `দুঃখিত — "${userMsg}"-এর সাথে মিল পাওয়া যায়নি। আপনি কোন পণ্য খুজতেছেন বিস্তারিত বলুন।`
          );
        }
      } catch (err: any) {
        console.error("Text search error:", err?.message || err);
      }

      if (!phrase) return null;
      console.log("userText dm", phrase);
      const userEmb = phrase ? await createTextEmbedding(phrase) : null;
      console.log("userEmbb dm", userEmb);
      if (!userEmb || !Array.isArray(userEmb) || userEmb.length === 0) {
        await sendMessage(
          senderId,
          shopId,
          "আপনার ছবির টেক্সট থেকে আমরা কোন পণ্যের সাথে মিল েপাইনি । আমাদের প্রতিনিধি আাপনার সাথে যোগাযোগ করবে।"
        );
        return;
      }
      // console.log("userEmb", userEmb);

      // 2) load posts for page
      const posts = await Post.find({ shopId }).lean().exec();
      if (!posts || posts.length === 0) {
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, এই পণ্যের কোন  তথ্য পাওয়া যাচ্ছে না। আমাদের প্রতিনিধি আাপনার সাথে যোগাযোগ করবে।"
        );
        return;
      }

      // 3) match: prefer per-image embedding, then per-image caption embedding, then post aggregated
      let best: {
        post: any;
        image?: any | null;
        score: number;
        matchedBy: "imageCaptionEmbedding" | "imageEmbedding" | "postEmbedding";
      } | null = null;

      const captionEmbCache = new Map<string, number[] | null>();

      for (const post of posts) {
        const images = Array.isArray(post.images) ? post.images : [];

        // image-level embeddings first
        for (const img of images) {
          if (
            img?.embedding &&
            Array.isArray(img.embedding) &&
            img.embedding.length
          ) {
            const score = cosineSimilarity(userEmb, img.embedding);
            if (!best || score > best.score)
              best = { post, image: img, score, matchedBy: "imageEmbedding" };
          }
        }

        // caption embedding on-demand
        for (const img of images) {
          if (
            img?.embedding &&
            Array.isArray(img.embedding) &&
            img.embedding.length
          )
            continue;
          const caption = (img?.caption || "").toString().trim();
          if (!caption) continue;
          if (!captionEmbCache.has(caption)) {
            try {
              const emb = await createTextEmbedding(caption);
              captionEmbCache.set(
                caption,
                Array.isArray(emb) && emb.length ? emb : null
              );
            } catch (e) {
              captionEmbCache.set(caption, null);
            }
          }
          const captionEmb = captionEmbCache.get(caption) || null;
          console.log("captionEmb", captionEmb);
          if (!captionEmb) continue;
          const score = cosineSimilarity(userEmb, captionEmb);
          if (!best || score > best.score)
            best = {
              post,
              image: img,
              score,
              matchedBy: "imageCaptionEmbedding",
            };
        }

        // post aggregated fallback
        if (
          (!best || best.matchedBy === "postEmbedding") &&
          post?.aggregatedEmbedding &&
          Array.isArray(post.aggregatedEmbedding) &&
          post.aggregatedEmbedding.length
        ) {
          const score = cosineSimilarity(userEmb, post.aggregatedEmbedding);
          if (!best || score > best.score)
            best = { post, image: null, score, matchedBy: "postEmbedding" };
        }
      } // end posts loop

      console.log("best match:", best);

      if (best && best.score >= SIMILARITY_THRESHOLD) {
        const imageCaption = best.image?.caption ?? null;
        const matchedImageUrl =
          best.image?.url ?? best.post?.images?.[0]?.url ?? null;
        if (imageCaption && imageCaption.toString().trim()) {
          await sendMessage(senderId, shopId, imageCaption.toString().trim());
        } else if (best.post?.message) {
          await sendMessage(senderId, shopId, best.post.message);
        } else {
          await sendMessage(
            senderId,
            shopId,
            "ম্যাচ পাওয়া গিয়েছে কিন্তু কোন ক্যাপশন পাওয়া যায়নি।"
          );
        }
        if (matchedImageUrl) {
          try {
            await sendImageAttachment(
              senderId,
              matchedImageUrl,
              pageAccessToken
            );
          } catch (err) {
            /* non-fatal */
          }
        }
        return;
      } else {
        await sendMessage(
          senderId,
          shopId,
          "দুঃখিত, কোন মিল পাওয়া যায়নি। 'Show similar' বা 'Talk to human' বেছে নিন।"
        );
        return;
      }
    } catch (err: any) {
      console.error("Image compare error:", err?.message || err);
      await sendMessage(
        senderId,
        shopId,
        "ইমেজ বিশ্লেষণে ত্রুটি হয়েছে — পরে চেষ্টা করুন বা 'Talk to human' নিন।"
      );
    } finally {
      await sendTyping(senderId, false);
    }
    return;
  } // end attachments branch

  const q = normalize(userMsg);
  console.log("message", q);
  // if (!q) {
  //   try {
  //     let reply = "";
  //     if (method === "gemini") {
  //       reply = await GeminiService.getResponseDM(
  //         senderId,
  //         shopId,
  //         userMsg,
  //         ActionType.DM
  //       );
  //     } else if (method === "chatgpt") {
  //       reply = await ChatgptService.getResponseDM(
  //         senderId,
  //         shopId,
  //         userMsg,
  //         ActionType.DM
  //       );
  //     } else if (method === "deepseek") {
  //       reply = await DeepSeekService.getResponseDM(
  //         senderId,
  //         shopId,
  //         userMsg,
  //         ActionType.DM
  //       );
  //     } else if (method === "groq") {
  //       reply = await GroqService.getResponseDM(
  //         senderId,
  //         shopId,
  //         userMsg,
  //         ActionType.DM
  //       );
  //     }
  //     await sendMessage(senderId, shopId, reply || "দয়া করে আবার বলুন।");
  //   } catch (err: any) {
  //     console.error("AI reply error:", err?.message || err);
  //     await sendMessage(
  //       senderId,
  //       shopId,
  //       "উত্তর তৈরিতে সমস্যা হয়েছে — পরে চেষ্টা করুন।"
  //     );
  //   }
  //   return;
  // }

  // Try image-level caption match (fastest): aggregate unwind images and match caption
  try {
    // build regex from the query (simple word OR)
    const words = q.split(/\s+/).map(escapeRegex);
    console.log("words", words);
    const captionRegex = new RegExp(words.join("|"), "i");
    console.log("captionRegex", captionRegex);

    const captionMatch = await Post.aggregate([
      { $match: { shopId } },
      { $unwind: "$images" },
      { $match: { "images.caption": { $regex: captionRegex } } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          postId: 1,
          message: 1,
          createdAt: 1,
          imageUrl: "$images.url",
          imageCaption: "$images.caption",
          imagePhotoId: "$images.photoId",
          postLink: 1,
        },
      },
      { $limit: 4 }, // return up to 4 best recent items
    ]).exec();
    // console.log("captionMatch Usrmsg", captionMatch);
    if (captionMatch && captionMatch.length > 0) {
        const cleanedPhraseTokens = words;
    
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
    
          let score:number = 0;
    
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
    
        if (chosen && chosen.imageUrl && best?.score) {
          console.log("img url",chosen.imageUrl);
          try {
            await sendImageAttachment(senderId, chosen.imageUrl, pageAccessToken);
          } catch (err) {
            console.warn(
              "sendImageAttachment failed:",
              (err as any)?.message || err
            );
          }
// await sendMessage(
//             senderId,
//             shopId,
//             (chosen.imageCaption || chosen.message || "").toString()
//           );


const userPrompt = `
A customer has ask for product information.
Use the data below:
Matched Product: ${(chosen.imageCaption || chosen.message || "").toString() || "(no caption)"}

Task:
1) First, confirm whether the customer is asking about the product identified by the matched caption: "${(chosen.imageCaption || chosen.message || "").toString()}".
2) State the product name/title based on the matched caption.
3) If a price is available in the provided data, include it.
4) Ask the customer a simple, direct question: "Would you like to purchase this item?"
5) If any required information (price, size, availability) is missing, offer a short alternative: "Would you like more details our team contact with you?"
6) Keep the response concise, professional, and friendly — no more than 3–4 short sentences.
`;
const systemInstruction="You are a professional customer support assistant. Use only the provided data; do not invent product details, prices, availability, or delivery information."

        
  
    //  let aiReply = "";
     const msgForAI = `${systemInstruction}\n\n${userPrompt}`;
     const fallbackOrder: AIMethod[] = ["gemini", "deepseek", "groq", "chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, msgForAI, ActionType.DM, fallbackOrder);
  
     try {
    if (aiReply && aiReply.trim().length > 0) {
      await sendMessage(senderId, shopId, aiReply);
    } else {
      // fallback human-friendly message
      await sendMessage(
        senderId,
        shopId,
        "দুঃখিত — পণ্যের সঠিক বিবরণ পাওয়া যায়নি। আপনি চান আমি একজন এজেন্টের সাথে সংযুক্ত করি?"
      );
    }
  } catch (err: any) {
    console.warn("sendMessage failed:", err?.message || err);
  }
          
          return;
        }
      }
    console.log("captionMatch", captionMatch);

    // If none, try post-level text search ($text or regex)
    let postMatch: any[] = [];
    try {
      // $text search (requires text index)
      postMatch = await Post.find({ shopId, $text: { $search: q } }, {
        score: { $meta: "textScore" },
      } as any)
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .limit(4)
        .lean()
        .exec();
      console.log("postMatch", postMatch);
    } catch (e) {
      // fallback to regex on message
      const msgRegex = new RegExp(words.join("|"), "i");
      postMatch = await Post.find({ shopId, message: { $regex: msgRegex } })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean()
        .exec();
      console.log("msgRegex", msgRegex);
    }

    if (postMatch && postMatch.length > 0) {
      // reply with first post's first image (if exists) and message
      const p = postMatch[0];
      const firstImg = p.images && p.images.length ? p.images[0].url : null;
      if (firstImg) {
        await sendImageAttachment(senderId, firstImg, pageAccessToken);
        await sendMessage(
          senderId,
          shopId,
          (p.images?.[0]?.caption || p.message || "").toString()
        );
        return;
      } else {
        // just send post message if no image
        await sendMessage(
          senderId,
          shopId,
          (p.message || "পোস্ট পাওয়া গেল").toString()
        );
        return;
      }
    }

    // If still nothing, fallback to AI conversational reply
    const fallbackOrder: AIMethod[] = ["gemini", "deepseek", "groq", "chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, userMsg, ActionType.DM, fallbackOrder);


    if (aiReply) {
      await sendMessage(senderId, shopId, aiReply);
    } else {
      await sendMessage(
        senderId,
        shopId,
        `দুঃখিত — "${userMsg}"-এর সাথে মিল পাওয়া যায়নি। আপনি কোন পণ্য খুজতেছেন বিস্তারিত বলুন। `
      );
    }
  } catch (err: any) {
    console.error("Text search error:", err?.message || err);
    // fallback to AI service attempt
    try {
       const fallbackOrder: AIMethod[] = ["gemini", "deepseek", "groq", "chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, userMsg, ActionType.DM, fallbackOrder);
await sendMessage(senderId, shopId, aiReply);
    } catch (err2: any) {
      console.error("AI fallback final error:", err2?.message || err2);
      await sendMessage(
        senderId,
        shopId,
        "কিছু সমস্যা হয়েছে — পরে চেষ্টা করুন বা 'Talk to human' বেছে নিন।"
      );
    }
  }
};

// create Post
export const handleAddFeed = async (value: any, pageId: string) => {
  try {
    const shop = await PageInfo.findOne({ shopId: pageId });
    if (!shop) {
      console.warn("handleAddFeed: PageInfo not found for", pageId);
      return;
    }
    const pageAccessToken = shop.accessToken || "";
    if (!pageAccessToken) {
      console.warn("handleAddFeed: No page access token for", pageId);
      return;
    }
    const postId = String(value.post_id || value.id || "");
    if (!postId) {
      console.warn("handleAddFeed: no post_id in webhook value", value);
      return;
    }
    // 1) fetch post attachments (to get per-image captions via subattachments)
    let postData: any = null;
    try {
      postData = await fetchPostAttachments(postId, pageAccessToken);
    } catch (err: any) {
      console.warn("fetchPostAttachments failed:", err?.message || err);
      // continue — we'll still try fallback with value.photos
    }
    // console.log("postData", postData.attachments.data);
    // console.log(
    //   "postData image",
    //   postData.attachments.data[0].media.subattachments.data[0]
    // );
    const attachments = Array.isArray(postData)
      ? postData
      : postData &&
        postData.attachments &&
        Array.isArray(postData.attachments.data)
      ? postData.attachments.data
      : [];

    // 4) safe subattachment access
    const firstSub = attachments[0]?.subattachments?.data?.[0] ?? null;

    // console.log("attachments (length):", attachments.length);
    // console.log(
    //   "first attachment (pretty):",
    //   JSON.stringify(attachments[0] || null, null, 2)
    // );
    console.log(
      "first subattachment (pretty):",
      JSON.stringify(firstSub, null, 2)
    );
    // 2) extract image captions from Graph response (if available)

    const imagesDescription = postData
      ? await extractImageCaptions(postData)
      : ([] as { photoId?: string; url?: string; caption?: string }[]);

    console.log("imagesDescription", imagesDescription);

    const urlToCaption = new Map<string, string>();
    const idToCaption = new Map<string, string>();

    imagesDescription.forEach((it: any) => {
      if (it.url) urlToCaption.set(it.url, it.caption ?? "");
      if (it.photoId) idToCaption.set(String(it.photoId), it.caption ?? "");
    });

    // 3) extract image URLs from webhook `value` (fallback if Graph not available)
    const imageUrls: string[] = extractImageUrlsFromFeed(value) || [];

    // If no imageUrls found in webhook, try to collect from postData attachments
    if (imageUrls.length === 0 && imagesDescription?.length > 0) {
      // take URLs from imagesDescription
      for (const it of imagesDescription) {
        if (it.url) imageUrls.push(it.url);
      }
    }
    // console.log("Found imageUrls:", imageUrls);
    // If still empty, nothing to process
    if (imageUrls.length === 0) {
      console.log("handleAddFeed: no image URLs found for", postId);
    }

    // 4) process each image: download, OCR (optional), create embedding
    type ImageResult = {
      url: string;
      photoId?: string | null;
      phash: string | null;
      caption?: string | null;
      embedding?: number[] | null;
    };

    // process each image concurrently with limit (to avoid too many parallel requests)
    const imagesProcessed: ImageResult[] = [];
    const CONCURRENCY = 6; // safe default
    // split into chunks for concurrency control
    for (let i = 0; i < imageUrls.length; i += CONCURRENCY) {
      const chunk = imageUrls.slice(i, i + CONCURRENCY);
      const promises: Promise<ImageResult>[] = chunk.map(
        async (url): Promise<ImageResult> => {
          try {
            // find matching caption (exact URL match)
            let caption: string | null = null;
            if (urlToCaption.has(url)) {
              caption = urlToCaption.get(url) || null;
            } else {
              // try fuzzy match: some Graph URLs may differ by params — match by pathname or last segment
              const matched = Array.from(urlToCaption.keys()).find((u) => {
                try {
                  const a = new URL(u).pathname;
                  const b = new URL(url).pathname;
                  return a === b || a.endsWith(b) || b.endsWith(a);
                } catch (e) {
                  return u === url;
                }
              });
              if (matched) caption = urlToCaption.get(matched) || null;
            }

            // try to discover photoId by scanning imagesDescription entries
            // let photoId: string | null = null;
            // const cd = imagesDescription.find(
            //   (d) =>
            //     d.url === url ||
            //     d.url?.includes(url) ||
            //     (d.photoId && url.includes(d.photoId))
            // );
            // console.log("photo id ", cd?.photoId);
            // if (cd?.photoId) photoId = String(cd.photoId);

            let emb: number[] | null = null;
            let phash = "";
            try {
              // download image into buffer (pass pageToken if needed)
              const buf = await downloadImageBuffer(url, pageAccessToken);
              phash = await computeHashFromBuffer(buf);
              // console.log("buf", buf);

              // optional OCR (non-fatal)
              let ocrText = "";

              try {
                ocrText = (await extractTextFromImageBuffer(buf)) || "";
                // console.log("ocrText", ocrText);
              } catch (ocrErr) {
                const err = ocrErr as AxiosError<{ message: string }>;
                console.warn("OCR failed for", url, err?.message || ocrErr);
                ocrText = "";
              }
              const textForEmbedding =
                [ocrText, value.message].filter(Boolean).join("\n").trim() ||
                "image";
              emb = await createTextEmbedding(textForEmbedding);
              // console.log("emb", emb);
              // return emb ;
            } catch (err: any) {
              console.warn(
                "Failed processing image url:",
                url,
                err?.message || err
              );
            }

            return {
              url,
              // photoId: photoId ?? null,
              phash,
              caption: caption ?? null,
              embedding: emb ?? undefined,
            };
          } catch (err: any) {
            console.warn("Failed processing image:", url, err?.message || err);
            return {
              url,
              photoId: null,
              phash: null,
              caption: null,
              embedding: null,
            };
          }
        }
      );

      const results = await Promise.all(promises);
      imagesProcessed.push(...results);
      console.log("imagesProcessed", imagesProcessed);
    }

    // 5) aggregated embedding (mean of non-null embeddings)
    const embeddingsList = imagesProcessed
      .map((it) => it.embedding)
      .filter((e): e is number[] => Array.isArray(e) && e.length > 0);

    const aggregatedEmbedding = embeddingsList.length
      ? averageEmbeddings(embeddingsList)
      : [];

    // 6) prepare payload & upsert to DB
    const payload: any = {
      postId,
      shopId: pageId,
      message: (postData?.message || value.message || "") as string,
      createdAt: value.created_time
        ? new Date(value.created_time * 1000)
        : new Date(),
      updatedAt: new Date(),
      images: imagesProcessed.map((it) => ({
        // photoId: it.photoId,
        phash: it.phash,
        url: it.url,
        caption: it.caption,
        // don't store raw embeddings per-image to DB here unless you want them:
        embedding: it.embedding ?? undefined,
      })),
    };

    if (aggregatedEmbedding.length)
      payload.aggregatedEmbedding = aggregatedEmbedding;

    // Persist: use PageService.createProduct (or adapt to your Post model)
    const result = await PageService.createProduct(payload);

    if (!result) {
      console.warn("handleAddFeed: createProduct returned falsy for", postId);
    } else {
      console.log(
        "handleAddFeed: saved post",
        postId,
        "images:",
        payload.images.length
      );
    }

    return result;
  } catch (err: any) {
    console.error("handleAddFeed: unexpected error:", err?.message || err);
    // Do not throw — webhook should return 200, but you can rethrow if you want failure visibility
    return null;
  }
};

const handleEditFeed = async (value: any, pageId: string) => {
  const { post_id, message } = value;
  // console.log("update value", value);
  try {
    const result = await PageService.updateProduct(value.from.id, post_id, {
      message,
      updatedAt: new Date(),
    });
    !result
      ? console.log("Feed Not Updated")
      : console.log("Feed Updated Successfully");
  } catch (error: any) {
    console.log("Feed Not Updated, Error: ", error?.message);
  }
};

const handleRemoveFeed = async (value: any, pageId: string) => {
  const { post_id } = value;
  console.log("remove value", value);
  try {
    const result = await PageService.deleteProduct(value.from.id, post_id);
    const result1 = await CommentHistory.findOneAndDelete({ postId: post_id });
    !result
      ? console.log("Feed Not Deleted")
      : console.log("Feed Deleted Successfully");
    !result1
      ? console.log("Comment History Not Deleted")
      : console.log("Comment History Deleted Successfully");
  } catch (error: any) {
    console.log(
      "Feed Not Deleted\nComment History Not Deleted\nError: ",
      error.message
    );
  }
};

const handleAddComment = async (value: any, pageId: string, method: string) => {
  const { comment_id, message, post_id, from } = value;
  const commenterId = from?.id;
  const userName = from?.name;
  if (!value.message) {
    console.log("📎 Attachment detected in comment!");
    await replyToComment(
      comment_id,
      pageId,
      "সংযুক্তি বা ভিডিও, ছবি, ফাইল এখনও অনুমোদিত নয়। আমাদের কাস্টমার সার্ভিস আপনার সাথে যোগাযোগ করবে।\nAttachments or videos, images, files are not allowed yet. Our customer service will contact you.",
      commenterId
    );
    return;
  }

  console.log(commenterId, pageId);
  if (commenterId === pageId) {
    console.log("⛔ Skipping own comment to avoid infinite loop.");
    return;
  }
  console.log("💬 New Comment:", message);

  let reply = "";

  try {
    if (method === "gemini") {
      reply = await GeminiService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    } else if (method === "chatgpt") {
      reply = await ChatgptService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    } else if (method === "deepseek") {
      reply = await DeepSeekService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    } else {
      reply = await GroqService.getCommnetResponse(
        commenterId,
        comment_id,
        userName || "Customer",
        message,
        post_id,
        pageId,
        ActionType.COMMENT
      );
    }
  } catch (err: any) {
    console.log("Error generating Comment Replay:", err.message);
  }

  try {
    await replyToComment(comment_id, pageId, reply as string, commenterId);
  } catch (error: any) {
    console.log("Error Sending Comment Replay: ", error?.message);
  }
};

const handleEditComment = async (value: any, pageId: string) => {
  const { comment_id, message } = value;
  try {
    const result = await CommentHistory.findOneAndUpdate(
      { "messages.commentId": comment_id },
      {
        $set: {
          "messages.$.content": message,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    !result
      ? console.log("Comment Not Updated")
      : console.log("Comment Updated Successfully");
  } catch (error: any) {
    console.log("Comment Not Updated, Error: ", error?.message);
  }
};

const handleRemoveComment = async (value: any, pageId: string) => {
  const { comment_id } = value;
  try {
    const result = await CommentHistory.findOneAndUpdate(
      { "messages.commentId": comment_id },
      {
        $pull: { messages: { commentId: comment_id } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    !result
      ? console.log("Comment Not Deleted")
      : console.log("Comment Deleted Successfully");
  } catch (error: any) {
    console.log("Comment Not Deleted, Error: ", error?.message);
  }
};

const handleIncomingMessages = async (
  req: Request,
  res: Response,
  pageId: string,
  method: "gemini" | "chatgpt" | "deepseek" | "groq"
) => {
  if (req.body.object !== "page") {
    return "Reply Not Bot Working";
  }

  for (const entry of req.body.entry) {
    const event = entry.messaging?.[0];

    if (event?.message) {
      handleDM(event, pageId, method);
      continue;
    }

    const changes = entry.changes || [];
    for (const change of changes) {
      const { field, value } = change;
      // console.log("Feed Change:", JSON.stringify(change, null, 2));
      if (
        field === "feed" &&
        ["post", "photo", "video", "status"].includes(value.item)
      ) {
        if (value.verb === "add") {
          handleAddFeed(value, pageId);
        } else if (value.verb === "edited") {
          handleEditFeed(value, pageId);
        } else if (value.verb === "remove") {
          handleRemoveFeed(value, pageId);
        }
      }

      if (field === "feed" && value.item === "comment") {
        if (value.verb === "add") {
          handleAddComment(value, pageId, method);
        } else if (value.verb === "edited") {
          handleEditComment(value, pageId);
        } else if (value.verb === "remove") {
          handleRemoveComment(value, pageId);
        }
      }
    }
  }

  return "Reply Bot Working";
};

export const WebHookService = {
  handleIncomingMessages,
};
