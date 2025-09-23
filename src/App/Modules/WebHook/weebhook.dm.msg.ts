import { AxiosError } from "axios";
import { sendMessage } from "../../api/facebook.api";
import { AIMethod, getAiReplySimple } from "../../utility/aiSimple";
import { cleanText, cleanTokens, computeHashFromBuffer, cosineSimilarity, createTextEmbedding, downloadImageBuffer, extractTextFromImageBuffer, hammingDistanceGeneric, isAskingForImage, jaccard, longestConsecutiveMatchRatio, sendImageAttachment, sendTyping, UI_BLACKLIST } from "../../utility/image.embedding";
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
         const wantsImage = isAskingForImage(userMsg); 
             if (chosen && chosen.imageUrl) {
               console.log("img url",chosen.imageUrl);
               
               try {
                if (wantsImage) {
                 await sendImageAttachment(senderId, chosen.imageUrl, pageAccessToken);
                }
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
     const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
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
     const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
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
          const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
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
    const words = q.split(/\s+/).map(escapeRegex); //['tine', 'bot']
    console.log("words-getting", words);
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
            const wantsImage = isAskingForImage(userMsg); 
          console.log("img url",chosen.imageUrl);
          try {
            if(wantsImage){
            await sendImageAttachment(senderId, chosen.imageUrl, pageAccessToken);
            }
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

        
          console.log("*************Coming without going to AI************")
    //  let aiReply = "";
     const msgForAI = `${systemInstruction}\n\n${userPrompt}`;
       const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
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
  const normalizedQ = q && q.length ? q.trim() : "";
  // 1) Try exact phrase regex if phrase is meaningful (>=3 chars and not just 'and' words)
  if (normalizedQ.length >= 3) {
    const phraseRegex = new RegExp("\\b" + escapeRegex(normalizedQ) + "\\b", "i");
    postMatch = await Post.aggregate([
      { $match: { shopId, $or: [
         { message: { $regex: phraseRegex } },
         { "images.caption": { $regex: phraseRegex } }
      ] } },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      { $project: { postId: 1, message: 1, images: 1, createdAt: 1 } }
    ]).exec();

    if (postMatch && postMatch.length) {
      console.log("phraseMatch", postMatch.length);
    }
  }

  // 2) If no phrase matches, try $text search (requires text index)
  if ((!postMatch || postMatch.length === 0) && normalizedQ.length > 0) {
    try {
      postMatch = await Post.find(
        { shopId, $text: { $search: normalizedQ } },
        { score: { $meta: "textScore" } } as any
      )
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .limit(6)
      .lean()
      .exec();
      console.log("textSearch", postMatch.length);
    } catch (e) {
         const err=e as AxiosError<{ message: string }>
      console.warn("text search failed (index?), will fallback to regex", err?.message || err);
    }
  }

  // 3) Regex OR fallback (safer: use word boundaries & limit words)
  if ((!postMatch || postMatch.length === 0) && normalizedQ.length > 0) {
    const wordsForRegex = words.slice(0, 6).map(escapeRegex).filter(Boolean);
    if (wordsForRegex.length) {
      const msgRegex = new RegExp("\\b(?:" + wordsForRegex.join("|") + ")\\b", "i");
      postMatch = await Post.find({
        shopId,
        $or: [
          { message: { $regex: msgRegex } },
          { "images.caption": { $regex: msgRegex } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()
      .exec();
      console.log("regexFallback", postMatch.length);
    }
  }
} catch (e) {
     const err=e as AxiosError<{ message: string }>
  console.error("postMatch block error:", err?.message || e);
}

// If matches found - pick best with a small confidence heuristic
if (postMatch && postMatch.length > 0) {
  // optional: score them by presence of caption, recentness etc.
  const scored = postMatch.map(p => {
    const hasImg = Array.isArray(p.images) && p.images.length > 0;
    const captionLen = hasImg ? ((p.images[0].caption || "").toString().length) : 0;
    // simple score: prefer posts with images + longer caption + recent
    const ageFactor = 1 / (1 + ((Date.now() - new Date(p.createdAt).getTime()) / (1000*60*60*24))); // recent -> ~1
    let base = (hasImg ? 1.2 : 0.5) + Math.min(1, captionLen / 100);
    return { post: p, score: base * ageFactor };
  }).sort((a,b) => b.score - a.score);

  const best = scored[0]?.post;
  const firstImg = best?.images && best.images.length ? best.images[0].url : null;
  const captionOrMessage = (best?.images?.[0]?.caption || best?.message || "").toString();

  if (firstImg) {
    const wantsImage = isAskingForImage(userMsg); // userMsg comes from event.message.text
    if (wantsImage) {
      try {
        await sendImageAttachment(senderId, firstImg, pageAccessToken);
      } catch(e) { 
        const err=e as AxiosError<{ message: string }>
        console.warn("sendImageAttachment failed:", err?.message || e); }
        console.log("not goint to Ai: ")
      await sendMessage(senderId, shopId, captionOrMessage || "পোস্ট পাওয়া গেছে।");
      return;
    } else {
      // Send caption/message and ask if they want the image
        console.log("not goint to Ai: ")

      await sendMessage(senderId, shopId, captionOrMessage || "পোস্ট পাওয়া গেছে।");
      await sendMessage(senderId, shopId, "আপনি কি ছবিটি দেখতে চান? যদি হ্যাঁ বলেন 'দেখাও' লিখুন।");
      return;
    }
  } else {
    // no image but message found
        console.log("not goint to Ai: ")

        console.log("no image but message found: ")

        const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
       const aiReply = await getAiReplySimple(method, senderId, shopId, userMsg, ActionType.DM, fallbackOrder);


    await sendMessage(senderId, shopId, aiReply || "পোস্ট পাওয়া গেছে।");
    return;
  }
}

    // If still nothing, fallback to AI conversational reply
    const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
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
      const fallbackOrder: AIMethod[] = ["chatgpt"].filter(x => x !== method) as AIMethod[];
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