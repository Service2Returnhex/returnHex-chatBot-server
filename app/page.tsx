"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import {toast} from 'react-toastify'
type TPost = {
  id: string;
  message: string;
  full_picture: string;
  created_time: Date;
};
export default function Home() {
  const router = useRouter();
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState([]);
  const [trainedPosts, setTrainedPosts] = useState<Array<{postId: string; shopId: string; isTrained: boolean}>>([]);
  const [loading, setLoading] = useState(false);
  const fetchPosts = async () => {
    if (!pageId || !accessToken) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${pageId}/posts?access_token=${accessToken}`,
        {
          params: {
            fields: "id,message,created_time,full_picture"
          }
        }
      );
      const res1 = await axios.get(
        `http://localhost:5002/api/v1/page/trained-products?pageId=768227369697648`
      );
      setPosts(response.data.data);
      setTrainedPosts(res1.data.data);
      toast.success("Post Retrieved!")
    } catch (error) {
      console.error("Failed to fetch posts", error);
      toast.error("Failed to fetch posts. Check your Page ID and Access Token.");
    } finally {
      setLoading(false);
    }
  };
  const handleTrainPosts = async (
    id: string,
    message: string,
    createdAt: Date
  ) => {
    
    try {
      setLoading(true);
      const {data} = await axios.post(`http://localhost:5002/api/v1/page/product`, {
        shopId: pageId,
        postId: id,
        message,
        createdAt,
      });
      if(data.success) {
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
  return (
    <div className="container mx-auto min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Train Post Data</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchPosts();
        }}
        className="mb-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Page ID
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Page Access Token
          </label>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          {loading ? "Loading..." : "Fetch Posts"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
        {posts
          .filter((post: TPost) => {
            if (!trainedPosts.length) return true;

            const matched = trainedPosts.find(
              (trainedPost) =>
                trainedPost.shopId === pageId && trainedPost.postId === post.id
            );

            if (matched) {
              return !matched.isTrained;
            }
            return true;
          })
          .map((post: TPost) => (
            <div
              key={post?.id}
              className="bg-white max-w-[350px] h-auto rounded-lg shadow p-4 flex flex-col justify-center"
            >
              
               <img 
               src={post.full_picture || 
               "https://t4.ftcdn.net/jpg/04/74/36/39/360_F_474363946_l1w7phLnR1vawp8gnSOZ4tNWW9t7RVfN.jpg"} 
               className="w-full h-full aspect-square rounded"/>
                <p className="text-gray-800 font-semibold mb-2 line-clamp-1">
                  {post?.message || "No message"}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(post?.created_time).toLocaleString()}
                </p>
              
              <div className="flex gap-2">
                <button
                onClick={() =>
                  handleTrainPosts(post?.id, post?.message, post?.created_time)
                }
                className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              >
                Train
              </button>
              <button
                onClick={() =>
                  // handleTrainPosts(post?.id, post?.message, post?.created_time)
                  toast.warning("Not Train button is not implemented")
                }
                className="mt-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                No Train
              </button>
                </div>
            </div>
          ))}
      </div>
    </div>
  );
}
