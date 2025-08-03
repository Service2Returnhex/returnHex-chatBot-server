"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormField } from "../components/ui/FormField";
import Navigation from "../components/ui/Navigation";
type TPost = {
  id: string;
  message: string;
  full_picture: string;
  created_time: Date;
};
type TTrainedPost = {
  name?: string;
  description?: string;
  price?: string;
  postId: string;
  message: string;
  full_picture: string;
  shopId: string;
  isTrained?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
export default function Home() {
  const router = useRouter();
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [trainedPosts, setTrainedPosts] = useState<TTrainedPost[]>([]);
  const [loading, setLoading] = useState(false);
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
          // console.log("pageid", data.data.shopId);
          setPageId(data.data.shopId);
          setAccessToken(data.data.accessToken);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const fetchPosts = async () => {
    // console.log("pageid || accessToken", accessToken);
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

      console.log(
        "Fetching trained-products from:",
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/trained-products?pageId=${pageId}`
      );
      console.log("response", response);
      console.log("res1", res1);
      setPosts(response.data.data);
      setTrainedPosts(res1.data.data);
      toast.success("Post Retrieved!");
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error(
        "Failed to fetch posts. Check your Page ID and Access Token."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrainPosts = async (
    id: string,
    message: string,
    full_picture: string,
    createdAt: Date
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/product`,
        {
          shopId: pageId,
          postId: id,
          message,
          full_picture,
          createdAt,
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
      setLoading(false);
    }
  };

  const handleNoTrain = async (shopId: string, postId: string) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };
  return (
    <div className=" min-h-screen bg-[linear-gradient(110deg,#020203,#02050c,#020816,#010b1f,#010e28,#011131,#01143b,#001744,#001a4d)] ">
      <Navigation title="Train Bot" />
      <div className="container mx-auto p-6">
        {/* <button
          onClick={() => router.back()}
          className="flex items-center gap-2 py-2 text-lg font-medium
        hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
          <span className="text-blue-500">Back</span>
        </button> */}
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
        <div className="flex justify-center gap-3 mb-5 mt-5">
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
                .map((post: TPost) => (
                  <div
                    key={post?.id}
                    className=" group relative w-full max-w-[350px] rounded-lg p-4 shadow-lg
    bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600
    hover:scale-[1.02] transition-transform duration-300
    text-white overflow-hidden "
                  >
                    <div
                      className="
     absolute inset-0 bg-white/5 backdrop-blur-sm
    opacity-0 group-hover:opacity-20 transition-opacity duration-300
  "
                    />
                    <div className="relative flex flex-col justify-center space-y-2">
                      <img
                        src={
                          post.full_picture ||
                          "https://t4.ftcdn.net/jpg/04/74/36/39/360_F_474363946_l1w7phLnR1vawp8gnSOZ4tNWW9t7RVfN.jpg"
                        }
                        className="w-full h-full aspect-square rounded "
                      />
                      <p className=" font-semibold text-lg my-2 line-clamp-2">
                        {post?.message || "No message"}
                      </p>
                      <p className="text-xs ">
                        Created: {new Date(post?.created_time).toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleTrainPosts(
                              post?.id,
                              post?.message,
                              post?.full_picture,
                              post?.created_time
                            )
                          }
                          className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600 cursor-pointer"
                        >
                          Train
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            : trainedPosts?.map((post: TTrainedPost) => {
                return (
                  <div
                    key={post?.postId}
                    className="bg-white max-w-[350px] h-auto rounded-lg shadow p-4 flex flex-col justify-center"
                  >
                    <img
                      src={
                        post.full_picture ||
                        "https://t4.ftcdn.net/jpg/04/74/36/39/360_F_474363946_l1w7phLnR1vawp8gnSOZ4tNWW9t7RVfN.jpg"
                      }
                      className="w-full h-full aspect-square rounded"
                    />
                    <p className="text-gray-800 font-semibold mb-2 line-clamp-1">
                      {post?.message || "No message"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created:{" "}
                      {post?.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleNoTrain(post.shopId, post.postId)}
                        className="mt-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                      >
                        Not Train
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
