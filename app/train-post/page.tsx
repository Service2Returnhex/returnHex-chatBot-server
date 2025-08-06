"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormField } from "../../components/ui/FormField";
import Navigation from "../../components/ui/Navigation";
import { PostCardNotTrained, PostCardTrained } from "../../components/PostCard";
import { TPost } from "@/types/post.type";
import { TTrainedPost } from "@/types/trainedPost.type";


export default function Home() {
  const router = useRouter();
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [trainedPosts, setTrainedPosts] = useState<TTrainedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainLoading, setTrainLoading] = useState<string | null>(null);
  const [notTrainLoading, setNotTrainLoading] = useState<string | null>(null);

  const [isTrained, setIsTraind] = useState(false);
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

  const fetchPosts = async () => {
    if (!pageId || !accessToken) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${pageId}/posts?access_token=${accessToken}`,
        {
          params: {
            fields: "id,message,created_time,full_picture",
          },
        }
      );
      const res1 = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/trained-products?pageId=${pageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      setPosts(response.data.data);
      setTrainedPosts(res1.data.data);
      toast.success("Post Retrieved!");
      localStorage.setItem("pageId", pageId);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error(
        "Failed to fetch posts. Check your Page ID and Access Token."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrainPosts = async (post: TPost) => {
    try {
      setTrainLoading(post.id);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product`,
        {
          shopId: pageId,
          postId: post.id,
          message: post.message,
          full_picture: post.full_picture,
          createdAt: post.created_time,
        }
      );
      // console.log("data", data);
      if (data.success) {
        toast.success("Post Trained");
        await fetchPosts();
      }
    } catch (error) {
      console.error("Training post failed:", error);
      toast.error("Training failed. Please try again.");
    } finally {
      setTrainLoading(null);
    }
  };

  const handleNoTrain = async (shopId: string, postId: string) => {
    try {
      setNotTrainLoading(postId);
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product/${postId}?shopId=${shopId}`
      );
      if (data.success) {
        toast.warning("Post removed from Training");
        await fetchPosts();
      }
    } catch (error) {
      console.error("Training removed post failed:", error);
      toast.error("Training remoded failed. Please try again.");
    } finally {
      setNotTrainLoading(null);
    }
  };
  return (
    <div className=" min-h-screen w-full relative bg-gray-900 ">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(70, 85, 110, 0.5) 0%, transparent 50%),
          radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.4) 0%, transparent 20%),
          radial-gradient(circle at 50% 10%, rgba(181, 184, 208, 0.3) 0%, transparent 20%)
        `,
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      />
      <Navigation title="Train Bot" />
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
