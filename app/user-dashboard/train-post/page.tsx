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

  return (
    <div className=" min-h-screen w-full relative bg-radial-aurora container">
      {/* <Navigation title="Train Bot" /> */}
      <div className="container mx-auto p-6">
        <div className="w-full text-white space-y-6 bg-gray-500/20  border border-white/50 filter bg-blur-md p-4  backdrop-blur-xl transition-transform rounded-2xl">
          <h1 className="text-2xl font-bold text-blue-500 mb-4">
            Train Post Data
          </h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPosts();
            }}
            className="mb-6 space-y-4"
          >
            <div>
              <FormField
                label="Page ID"
                id="pageId"
                value={pageId}
                onChange={(val) => setPageId(val)}
                placeholder="Enter your Facebook pageId"
                required
              />
            </div>
            <div>
              <FormField
                label="Access Token"
                id="accessToken"
                value={accessToken}
                onChange={(val) => setAccessToken(val)}
                placeholder="Enter your Facebook Access"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-600 cursor-pointer"
            >
              {loading ? "Loading..." : "Fetch Posts"}
            </button>
          </form>
        </div>
        {/* button section */}
        <div className="flex justify-center gap-3  my-8 relative">
          <button
            onClick={() => {
              setIsTraind(false);
            }}
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-red-600 cursor-pointer"
          >
            Not Trained
          </button>
          <button
            onClick={() => {
              setIsTraind(true);
            }}
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600 cursor-pointer"
          >
            Trained
          </button>
        </div>
        {/* post card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
          {!isTrained
            ? posts
                .filter((post: TPost) => {
                  if (!trainedPosts?.length) return true;

                  const matched = trainedPosts.find(
                    (trainedPost) =>
                      trainedPost.shopId === pageId &&
                      trainedPost.postId === post.id
                  );

                  if (matched) {
                    return !matched.isTrained;
                  }
                  return true;
                })
                .map((post: TPost, idx: number) => (
                  <PostCardNotTrained
                    key={idx}
                    post={post}
                    handleTrainPosts={handleTrainPosts}
                    trainLoading={trainLoading}
                    setTrainLoading={setTrainLoading}
                  />
                ))
            : trainedPosts?.map((post: TTrainedPost, idx: number) => {
                return (
                  <PostCardTrained
                    key={idx}
                    post={post}
                    handleNoTrain={handleNoTrain}
                    notTrainLoading={notTrainLoading}
                    setNotTrainLoading={setNotTrainLoading}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
}
