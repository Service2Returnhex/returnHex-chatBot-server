<<<<<<< HEAD
import TrainPost from "@/components/TrainPost";

export default function TrainPosts() {
=======
"use client";
import { IImageItem, TPost } from "@/types/post.type";
import { TTrainedPost } from "@/types/trainedPost.type";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  PostCardNotTrained,
  PostCardTrained,
} from "../../../components/PostCard";
import { FormField } from "../../../components/ui/FormField";

export default function Home() {
  const router = useRouter();
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState<TPost[]>([]);  
  const [trainedPosts, setTrainedPosts] = useState<TTrainedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainLoading, setTrainLoading] = useState<string | null>(null);
  const [notTrainLoading, setNotTrainLoading] = useState<string | null>(null);

  const [isTrained, setIsTraind] = useState(false);
  // console.log("posts",posts);
  useEffect(() => {
    const savedPageId = localStorage.getItem("pageId");
    if (!savedPageId) return;
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${savedPageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((res) => {
        const { data } = res;
        if (data.success) {
          setPageId(data.data.shopId);
          setAccessToken(data.data.accessToken);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
 const FIELDS="id,message,created_time,full_picture,attachments{media_type,media,description,embedding,phash,title,subattachments{media,description,embedding,phash,title,target}}"
const fetchPosts = async () => {
    if (!pageId || !accessToken) {
      toast.warn("Page ID or Access Token missing");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/posts`, {
        params: {
          access_token: accessToken,
          fields: FIELDS,
          limit: 50,
        },
        timeout: 15000,
      });

      const fbPostsRaw = Array.isArray(response?.data?.data) ? response.data.data : [];

      const mappedPosts: TPost[] = fbPostsRaw.map((p: any) => {
        const images: IImageItem[] = [];

        if (p.attachments && Array.isArray(p.attachments.data)) {
          for (const att of p.attachments.data) {
            if (att.subattachments && Array.isArray(att.subattachments.data)) {
              for (const sub of att.subattachments.data) {
                const url =
                  sub?.media?.image?.src ||
                  sub?.media?.image?.url ||
                  sub?.media?.source ||
                  sub?.media?.image?.src_big;
                if (!url) continue;
                images.push({
                  url: String(url),
                  caption: (sub?.description || sub?.title || "").toString() || "",
                  embedding: [],
                  phash: "",
                });
              }
            } else {
              const url =
                att?.media?.image?.src ||
                att?.media?.image?.url ||
                att?.media?.source ||
                att?.media?.image?.src_big;
              if (!url) continue;
              images.push({
                url: String(url),
                caption: (att?.description || att?.title || "").toString() || "",
                embedding: [],
                phash: "",
              });
            }
          }
        }

        if (images.length === 0 && p.full_picture) {
          images.push({ url: String(p.full_picture), caption: "", embedding: [], phash: "" });
        }

        return {
          id: p.id,
          message: p.message || "",
          full_picture: p.full_picture || "",
          images,
          aggregatedEmbedding: p.aggregatedEmbedding ?? [],
          isTrained: false,
          created_time: p.created_time || new Date().toISOString(),
        } as TPost;
      });

      setPosts(mappedPosts);

      // fetch trained posts from backend
      try {
        const res1 = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/trained-products?pageId=${pageId}`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });
        setTrainedPosts(Array.isArray(res1?.data?.data) ? res1.data.data : []);
      } catch (err) {
        console.warn("fetch trained posts failed", err);
        setTrainedPosts([]);
      }

      toast.success("Posts retrieved");
      localStorage.setItem("pageId", pageId);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error("Failed to fetch posts. Check Page ID & Access Token.");
    } finally {
      setLoading(false);
    }
  };

  function buildPayload(pageIdLocal: string, post: TPost) {
    const imagesArray: IImageItem[] =
      Array.isArray(post.images) && post.images.length
        ? post.images.map((img) => ({
            url: String(img.url || "").trim(),
            caption: img.caption ? String(img.caption) : "",
            embedding: Array.isArray(img.embedding) ? img.embedding : [],
            phash: img.phash ? String(img.phash) : "",
          }))
        : post.full_picture
        ? [
            {
              url: String(post.full_picture),
              caption: "",
              embedding: [],
              phash: "",
            },
          ]
        : [];

    return {
      shopId: pageIdLocal,
      postId: post.id,
      message: post.message || "",
      full_picture: post.full_picture || (imagesArray[0]?.url || ""),
      summarizedMsg: post.summarizedMsg ?? "",
      images: imagesArray,
      aggregatedEmbedding: Array.isArray(post.aggregatedEmbedding) ? post.aggregatedEmbedding : [],
      createdAt:
        post.created_time instanceof Date ? post.created_time.toISOString() : new Date(post.created_time).toISOString(),
    };
  }

  const handleTrainPosts = async (post: TPost) => {
    try {
      setTrainLoading(post.id);
      if (!post?.id) {
      toast.error("Post id missing");
      return;
    }
    if (!pageId) {
      toast.error("Page ID missing");
      return;
    }
 
      const payload = buildPayload(pageId, post);
      console.log("TRAIN PAYLOAD (sending):", payload);
      // call backend train endpoint (backend will compute phash & embedding)
      const URL=`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product/${encodeURIComponent(post.id)}/train`
      const { data } = await axios.post(URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 120000,
    });
      console.log("train response", data);
      if (data && data.success) {
        toast.success("Post trained");
        await fetchPosts();
      } else {
        toast.error(data?.message || "Training failed on server");
      }
    } catch (err) {
      const error=err as AxiosError<{message : string}>
      console.error("Training post failed:", error);
      if (error?.response) {
    console.error("HTTP status:", error.response.status);
    console.error("Response data:", error.response.data);
    toast.error("Training failed: " + (error.response.data?.message || JSON.stringify(error.response.data)));
  } else if (error?.request) {
    console.error("No response received, request:", error.request);
    toast.error("No response from server (network).");
  } else {
    toast.error("Training failed: " + (error.message || "unknown error"));
  }
      toast.error("Training failed. Please try again.");
    } finally {
      setTrainLoading(null);
    }
  };

  const handleNoTrain = async (shopId: string | undefined, postId: string | undefined) => {
    if (!shopId || !postId) return;
    try {
      setNotTrainLoading(postId || null);
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product/${postId}?shopId=${shopId}`);
      if (res.data?.success) {
        toast.success("Removed from trained");
        await fetchPosts();
      } else {
        toast.error(res.data?.message || "Remove failed");
      }
    } catch (err) {
      console.error("remove failed", err);
      toast.error("Remove failed");
    } finally {
      setNotTrainLoading(null);
    }
  };

>>>>>>> feat/v2
  return (
    <div>
      <TrainPost />
    </div>
  );
}
