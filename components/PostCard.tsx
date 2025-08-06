import { TPost } from "@/types/post.type";
import { TTrainedPost } from "@/types/trainedPost.type";
import { Dispatch, SetStateAction } from "react";
type NTProps = {
  post: TPost;
  handleTrainPosts: (post: TPost) => void;
  trainLoading: string | null;
  setTrainLoading: Dispatch<SetStateAction<string | null>>;
};
export function PostCardNotTrained(prop: NTProps) {
  const { post, handleTrainPosts, trainLoading } = prop;
  return (
    <>
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
          <p className="text-xs">
            Created: {new Date(post?.created_time).toLocaleString()}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handleTrainPosts(post)}
              className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600 cursor-pointer relative"
            >
              {trainLoading === post.id ? "Training" : "Train"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

type TProps = {
  post: TTrainedPost;
  handleNoTrain: (shopId: string, postId: string) => void;
  notTrainLoading: string | null;
  setNotTrainLoading: Dispatch<SetStateAction<string | null>>;
};
export function PostCardTrained(props: TProps) {
  const { post, handleNoTrain, notTrainLoading } = props;
  return (
    <div
      key={post?.postId}
      className=" group relative w-full max-w-[350px] min-h-[505px] rounded-lg p-4 shadow-lg
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
        <p className="text-xs">
          Created: {new Date(post?.createdAt).toLocaleString()}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => handleNoTrain(post.shopId, post.postId)}
            className="mt-4 px-3 py-1 bg-red-600 text-white rounded  hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600 cursor-pointer relative"
          >
            {notTrainLoading === post.postId ? "Not Training" : "Not Train"}
          </button>
        </div>
      </div>
    </div>
  );
}
