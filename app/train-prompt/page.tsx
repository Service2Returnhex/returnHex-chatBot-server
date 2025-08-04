"use client";

import axios from "axios";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navigation from "../components/ui/Navigation";

const TrainPrompt = () => {
  const [dmPrompt, setDmPrompt] = useState("");
  const [commentPrompt, setCommentPrompt] = useState("");
  const [isLoadingDM, setIsLoadingDM] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [pageId, setPageId] = useState("");

  // Fetch pageId and existing prompts
  useEffect(() => {
    const savedId = localStorage.getItem("pageId");
    if (!savedId) {
      toast.error("No Page ID found. Please configure your page first.");
      return;
    }
    setPageId(savedId);

    // Fetch existing prompts from API
  }, []);
  const getPromt = async () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${pageId}`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      })
      .then((res) => {
        console.log("getprompt", res.data.data.dmSystemPromt);
        if (res.data?.data) {
          setDmPrompt(res.data.data.dmSystemPromt || "");
          setCommentPrompt(res.data.data.cmntSystemPromt || "");
        }
      })
      .catch(() => {
        toast.error("Failed to load existing prompts.");
      });
  };
  // Save DM Prompt
  const handleSaveDM = async () => {
    if (!dmPrompt.trim()) {
      toast.error("Please enter a DM Message Prompt.");
      return;
    }
    setIsLoadingDM(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/set-dm-promt/${pageId}`,
        { dmPrompt },
        {
          headers: { "ngrok-skip-browser-warning": "69420" },
        }
      );
      toast.success("DM Prompt saved successfully!");
    } catch (error) {
      toast.error("Failed to save DM Prompt.");
    } finally {
      setIsLoadingDM(false);
    }
  };

  // Save Comment Prompt
  const handleSaveComment = async () => {
    if (!commentPrompt.trim()) {
      toast.error("Please enter a Comment Prompt.");
      return;
    }
    setIsLoadingComment(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/set-cmnt-promt/${pageId}`,
        { commentPrompt },
        {
          headers: { "ngrok-skip-browser-warning": "69420" },
        }
      );
      toast.success("Comment Prompt saved successfully!");
    } catch (error) {
      toast.error("Failed to save Comment Prompt.");
    } finally {
      setIsLoadingComment(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-gray-900 text-white bg-fixed">
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
      <Navigation title="Train Prompt" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* DM Prompt Form */}
          <div className="shadow-elegant p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <div className="flex">
              <div className="w-2/3">
                <h2 className="text-xl font-bold text-blue-400 mb-2">
                  DM Message Prompt
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Instructions for how your bot should respond to direct
                  messages.
                </p>
              </div>
              {pageId ? (
                <button
                  onClick={getPromt}
                  disabled={isLoadingDM}
                  className={`mt-4 w-10 h-10 flex absolute right-4 top-2 items-center justify-center rounded-full 
    bg-gradient-to-r from-green-500 to-teal-500 text-white 
    hover:shadow-lg transition  cursor-pointer
    ${isLoadingDM ? "opacity-50 cursor-not-allowed" : ""}`}
                  title="Edit DM Prompt"
                >
                  <Pencil size={18} strokeWidth={2} />
                </button>
              ) : (
                ""
              )}
            </div>
            <textarea
              value={dmPrompt}
              onChange={(e) => setDmPrompt(e.target.value)}
              placeholder="Enter instructions for DM responses..."
              className="min-h-[200px] w-full p-4 rounded-md bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-400 mt-1">
              Characters: {dmPrompt.length}
            </div>
            <div className="flex gap-8">
              <button
                onClick={handleSaveDM}
                disabled={isLoadingDM}
                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-md hover:shadow-lg transition cursor-pointer"
              >
                {isLoadingDM ? "Saving..." : "Save DM Prompt"}
              </button>
            </div>
          </div>

          {/* Comment Prompt Form */}
          <div className="shadow-elegant p-6 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <div className="flex">
              <div className="w-2/3">
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  Comment Prompt
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Instructions for how your bot should reply to post comments.
                </p>
              </div>
              {pageId ? (
                <button
                  onClick={getPromt}
                  disabled={isLoadingDM}
                  className={`mt-4 w-10 h-10 flex absolute right-4 top-2 items-center justify-center rounded-full 
    bg-gradient-to-r from-blue-500 to-purple-500 text-white 
    hover:shadow-lg transition  cursor-pointer
    ${isLoadingDM ? "opacity-50 cursor-not-allowed" : ""}`}
                  title="Edit DM Prompt"
                >
                  <Pencil size={18} strokeWidth={2} />
                </button>
              ) : (
                ""
              )}
            </div>
            <textarea
              value={commentPrompt}
              onChange={(e) => setCommentPrompt(e.target.value)}
              placeholder="Enter instructions for comment responses..."
              className="min-h-[200px] w-full p-4 rounded-md bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="text-xs text-gray-400 mt-1">
              Characters: {commentPrompt.length}
            </div>
            <button
              onClick={handleSaveComment}
              disabled={isLoadingComment}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-md hover:shadow-lg transition cursor-pointer"
            >
              {isLoadingComment ? "Saving..." : "Save Comment Prompt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainPrompt;
