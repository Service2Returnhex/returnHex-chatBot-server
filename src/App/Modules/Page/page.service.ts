import { AxiosError } from "axios";
import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../utility/AppError";
import { averageEmbeddings, computeHashFromBuffer, createTextEmbedding, downloadImageBuffer, extractImageCaptions, extractImageUrlsFromTrainPost, extractTextFromImageBuffer } from "../../utility/image.embedding";
import {
  Logger,
  LogMessage,
  LogPrefix,
  LogService,
} from "../../utility/Logger";
import { AIResponse } from "../../utility/summarizer";
import { countWords } from "../../utility/wordCounter";
import { ChatHistory } from "../Chatgpt/chat-history.model";
import { CommentHistory } from "../Chatgpt/comment-histroy.model";
import { Order } from "./order.model";
import { IPageInfo, PageInfo } from "./pageInfo.model";
import { IPost, Post } from "./post.mode";

//Product services
const getProducts = async (pageId: string) => {
  const result = await Post.find({ shopId: pageId });
  if (!result.length)
    Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.NOT_FOUND);
  Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.RETRIEVED);
  return result;
};

const getTraindProducts = async (pageId: string) => {
  const result = await Post.find({ shopId: pageId, isTrained: true });
  // console.log("train result",result);
  if (!result.length)
    Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.NOT_FOUND);
  Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.RETRIEVED);
  return result;
};

const getProductById = async (pageId: string, id: string) => {
  const result = await Post.findOne({ shopId: pageId, postId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found");
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.RETRIEVED);
  return result;
};

function sanitizeImages(maybe: any, fallbackFullPicture?: string) {
  if (!Array.isArray(maybe)) maybe = [];
  const images = (maybe as any[])
    .map((img: any) => ({
      url: img?.url ? String(img.url).trim() : "",
      caption: img?.caption ? String(img.caption) : "",
      embedding: Array.isArray(img?.embedding) ? img.embedding : [],
      phash: img?.phash ? String(img.phash) : "",
    }))
    .filter((i) => i.url && i.url.length > 0);

  if (images.length === 0 && fallbackFullPicture) {
    images.push({
      url: String(fallbackFullPicture).trim(),
      caption: "",
      embedding: [],
      phash: "",
    });
  }

  return images;
}

const createProduct = async (payload: any) => {
  console.log(
    "CREATE_PRODUCT incoming payload:",
    JSON.stringify(payload, null, 2)
  );
  if (!payload?.shopId || !payload?.postId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing shopId or postId");
  const findProduct = await Post.findOne({
    shopId: payload.shopId,
    postId: payload.postId,
  }).lean();
  if (findProduct) return "Product Already Created";

  const images = sanitizeImages(payload.images, payload.full_picture);
  // const aggregatedEmbedding=sanitizeEmbedding(payload?.aggregatedEmbedding)
  console.log("image", images);
  const aggregatedEmbedding = Array.isArray(payload.aggregatedEmbedding)
    ? payload.aggregatedEmbedding.map(Number).filter((n:any) => !Number.isNaN(n))
    : [];
  const message = payload.message ? String(payload.message) : "";
  let summarizedMsg = payload.summarizedMsg
    ? String(payload.summarizedMsg)
    : "";

  if (!summarizedMsg || summarizedMsg.trim().length === 0) {
    if ((message || "").split(/\s+/).filter(Boolean).length > 30) {
      try {
        const short = await AIResponse(
          payload?.shopId,
          message || "",
          "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens",
          50
        );
        summarizedMsg = String(short || "").trim();
      } catch (e) {
        summarizedMsg = message.slice(0, 300);
      }
    } else summarizedMsg = message.slice(0, 300);
  }

  const createObj: any = {
    shopId: payload.shopId,
    postId: payload.postId,
    message,
    summarizedMsg,
    full_picture: payload.full_picture || (images[0] && images[0].url) || "",
    images,
    aggregatedEmbedding,
    isTrained: true,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
  };

  const result = await Post.create(createObj);
  if (!result) {
    /* handle error */
  }
  return result;
};

const createAndTrainProduct = async (payload: any) => {
  // ensure DB connected
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, "MongoDB not connected");
  }
  console.log("payload", payload);
  if (!payload.shopId || !payload.postId)
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing shopId or postId");
  const shopId = payload.shopId;
  const postId = payload.postId;
  const findProduct = await Post.findOne({
    shopId: payload.shopId,
    postId: payload.postId,
  }).lean();
  if (findProduct) return "Product Already Created";

  console.log("TRAIN_PRODUCT incoming payload:", JSON.stringify(payload || {}, null, 2));
  console.log("trai product image", payload.images);

  const page = await PageInfo.findOne({ shopId }).lean().exec();
  const pageAccessToken = page?.accessToken || undefined;

  const postData = payload.rawPost;

  const attachments = Array.isArray(postData)
    ? postData
    : postData &&
      postData?.attachments &&
      Array.isArray(postData?.attachments.data)
      ? postData?.attachments.data
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
  const imageUrls: string[] = extractImageUrlsFromTrainPost(payload) || [];

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
            const buf = await downloadImageBuffer(url, pageAccessToken ?? "");
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
              [ocrText, payload.message].filter(Boolean).join("\n").trim() ||
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
  const payload2: any = {
    postId,
    shopId,
    message: (postData?.message || payload.message || "") as string,
    createdAt: payload.created_time
      ? new Date(payload.created_time * 1000)
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
    payload2.aggregatedEmbedding = aggregatedEmbedding;

  // Persist: use PageService.createProduct (or adapt to your Post model)
  const result = await PageService.createProduct(payload2);

  if (!result) {
    console.warn("handleAddFeed: createProduct returned falsy for", postId);
  } else {
    console.log(
      "handleAddFeed: saved post",
      postId,
      "images:",

    );

    console.log("payload train post ", payload);
    // console.log("payload train post ", payload.rawPost.attachments);
  }

  return result;
};


const updateProduct = async (
  pageId: string,
  id: string,
  payload: Partial<IPost>
) => {
  const existing = await Post.findOne({ shopId: pageId, postId: id });
  // console.log("update existing", existing);
  if (!existing) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found!");
  }

  let shorterInfo: string | undefined = "";
  if (countWords(payload.message as string) > 30) {
    shorterInfo = await AIResponse(
      pageId,
      payload.message as string,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 50 tokens",
      50
    );
    payload.summarizedMsg = shorterInfo as string;
  }

  const result = await Post.updateOne({ shopId: pageId, postId: id }, payload, {
    runValidators: true,
  });
  // console.log("update result", result);
  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_UPDATED);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Product Not Updated!"
    );
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.UPDATED);
  return result;
};

const deleteProduct = async (pageId: string, id: string) => {
  const existing = await Post.findOne({ shopId: pageId, postId: id });

  if (!existing) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Found!");
  }
  const result = await Post.findOneAndDelete({ shopId: pageId, postId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.NOTE_DELETED);
    throw new ApiError(httpStatus.NOT_FOUND, "Product Not Deleted!");
  }
  Logger(LogService.DB, LogPrefix.PRODUCT, LogMessage.DELETED);

  return result;
};

// Shop services
const getShops = async () => {
  const result = await PageInfo.find();
  if (!result.length) {
    Logger(LogService.DB, LogPrefix.SHOPS, LogMessage.NOT_FOUND);
  }
  Logger(LogService.DB, LogPrefix.SHOPS, LogMessage.RETRIEVED);

  return result;
};

const getShopByOwnerAll = async (ownerId: string) => {
  const filter = { ownerId };
  const pages = await PageInfo.find(filter).sort("-createdAt").lean().exec();
  return pages;
};

const getShopById = async (id: string) => {
  const result = await PageInfo.findOne({ shopId: id });
  if (!result) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }

  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.RETRIEVED);
  return result;
};

const toggleStatus = async (id: string) => {
  const page = await PageInfo.findById(id);
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, "Page not found");

  page.isStarted = !page.isStarted;
  await page.save();
  return page;
};

const createShop = async (payload: IPageInfo) => {
  const existing = await PageInfo.findOne({ shopId: payload.shopId });
  console.log("payload", payload);
  if (existing) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CONFLICT);
    throw new ApiError(httpStatus.CONFLICT, "Shop Already Exists!");
  }

  const shopInfo = `PageName: ${payload.pageName}, Category: ${payload.pageCategory ?? "N/A"
    }, Address: ${payload?.address ?? "N/A"}
    Phone: ${payload?.phone ? payload.phone : "N/A"}, Email: ${payload?.email ? payload.email : "N/A"
    }, MoreInfo: ${payload?.moreInfo ?? "N/A"}
    `;

  let shorterInfo: string | undefined = "";
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      payload.shopId,
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 100 tokens",
      100
    );
    payload.summary = shorterInfo as string;
  }

  const result = await PageInfo.create(payload);
  if (!result) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_CREATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not created");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.CREATED);

  return result;
};

const updateShop = async (id: string, payload: Partial<IPageInfo>) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }

  const shopInfo = `PageName: ${payload.pageName ? payload.pageName : isExists.pageName
    }, Category: ${payload.pageCategory ? payload.pageCategory : isExists.pageCategory
    }, Address: ${payload.address ? payload.address : isExists.address}
    Phone: ${payload.phone ? payload.phone : isExists.phone}, Email: ${payload.email ? payload.email : isExists.email
    }, MoreInfo: ${payload.moreInfo ? payload.moreInfo : isExists.moreInfo}
    `;

  let shorterInfo: string | undefined = "";
  if (countWords(shopInfo) > 30) {
    shorterInfo = await AIResponse(
      payload.shopId as string,
      shopInfo,
      "make the info as shorter as possible(summarize) but don't left anything necessary in 100 tokens",
      100
    );
    payload.summary = shorterInfo as string;
  }

  const result = await PageInfo.updateOne({ shopId: id }, payload, {
    
    runValidators: true,
  });

  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const deleteShop = async (id: string) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.deleteOne({ shopId: id });
  if (!result.deletedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOTE_DELETED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not Deleted");
  }
  return result;
};

const setDmPromt = async (id: string, dmSystemPromt: string) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.updateOne(
    { shopId: id },
    { dmSystemPromt },
    { runValidators: true }
  );

  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const setCmntPromt = async (id: string, cmntSystemPromt: string) => {
  const isExists = await PageInfo.findOne({ shopId: id });
  if (!isExists) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_FOUND);
    throw new ApiError(httpStatus.NOT_FOUND, "Shop Not Found");
  }
  const result = await PageInfo.updateOne(
    { shopId: id },
    { cmntSystemPromt },
    { runValidators: true }
  );
  if (!result.modifiedCount) {
    Logger(LogService.DB, LogPrefix.SHOP, LogMessage.NOT_UPDATED);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Shop Not updated");
  }
  Logger(LogService.DB, LogPrefix.SHOP, LogMessage.UPDATED);

  return result;
};

const getDmMessageCount = async (shopId: string): Promise<number> => {
  if (!shopId) return 0;

  const result = await ChatHistory.aggregate([
    { $match: { shopId } },
    { $unwind: "$messages" },
    { $match: { "messages.role": "assistant" } },
    { $count: "assistantCount" },
  ]);

  return result.length && result[0].assistantCount
    ? result[0].assistantCount
    : 0;
};

const getCmtMessageCount = async (shopId: string): Promise<number> => {
  if (!shopId) return 0;
  const result = await CommentHistory.aggregate([
    { $match: { shopId } },
    { $unwind: "$messages" },
    { $match: { "messages.role": "assistant" } },
    { $count: "assistantCount" },
  ]);
  return result.length && result[0].assistantCount
    ? result[0].assistantCount
    : 0;
};

const getOrders = async (pageId: string) => {
  const result = await Order.find({ shopId: pageId });
  console.log(result);
  if (!result.length)
    Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.NOT_FOUND);
  Logger(LogService.DB, LogPrefix.PRODUCTS, LogMessage.RETRIEVED);
  return result;
};

export const PageService = {
  getProducts,
  getTraindProducts,
  getProductById,
  createAndTrainProduct,
  createProduct,
  updateProduct,
  deleteProduct,

  getShops,
  getShopById,
  createShop,
  getShopByOwnerAll,
  toggleStatus,
  updateShop,
  deleteShop,
  setDmPromt,
  setCmntPromt,

  getOrders,

  getDmMessageCount,
  getCmtMessageCount,
};
