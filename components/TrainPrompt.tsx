"use client";

import axios from "axios";
import { Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const TrainPrompt = () => {
  const [dmSystemPromt, setDmSystemPromt] = useState("");
  const [cmntSystemPromt, setCmntSystemPromt] = useState("");
  const [isLoadingDM, setIsLoadingDM] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [pageId, setPageId] = useState("");
  const [dmEdit, setDmEdit] = useState(false);
  const [cmtEdit, setCmtEdit] = useState(false);
  useEffect(() => {
    const savedPageId = localStorage.getItem("pageId");
    if (!savedPageId) {
      toast.error("No Page ID found. Please configure your page first.");
      return;
    }

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
        // const { data } = res;
        if (res.data?.data) {
          setDmSystemPromt(res.data.data.dmSystemPromt || "");
          setCmntSystemPromt(res.data.data.cmntSystemPromt || "");
        }
      })
      .catch((err) => {
        console.log(err);
      });
    setPageId(savedPageId);
  }, []);

  //   edit DM Prompt
  const editDMPrompt = async () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${pageId}`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      })
      .then((res) => {
        console.log("getprompt", res.data.data.dmSystemPromt);
        if (res.data?.data) {
          setDmSystemPromt(res.data.data.dmSystemPromt || "");
          setDmEdit(true);
        }
      })
      .catch(() => {
        toast.error("Failed to load existing prompts.");
      });
  };
  // edit Comment Prompt
  const editCmtPrompt = async () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${pageId}`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      })
      .then((res) => {
        if (res.data?.data) {
          setCmntSystemPromt(res.data.data.cmntSystemPromt || "");
          setCmtEdit(true);
        }
      })
      .catch(() => {
        toast.error("Failed to load existing prompts.");
      });
  };

  // Save DM Prompt
  const handleSaveDM = async () => {
    if (!dmSystemPromt.trim()) {
      toast.error("Please enter a DM Message Prompt.");
      return;
    }
    setIsLoadingDM(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/set-dm-promt/${pageId}`,
        { dmSystemPromt },
        {
          headers: { "ngrok-skip-browser-warning": "69420" },
        }
      );
      toast.success("DM Prompt saved successfully!");
      setDmEdit(false);
    } catch (error) {
      toast.error("Failed to save DM Prompt.");
    } finally {
      setIsLoadingDM(false);
    }
  };

  // Save Comment Prompt
  const handleSaveComment = async () => {
    if (!cmntSystemPromt.trim()) {
      toast.error("Please enter a Comment Prompt.");
      return;
    }
    setIsLoadingComment(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/set-cmnt-promt/${pageId}`,
        { cmntSystemPromt },
        {
          headers: { "ngrok-skip-browser-warning": "69420" },
        }
      );
      toast.success("Comment Prompt saved successfully!");
      setCmtEdit(false);
    } catch (error) {
      toast.error("Failed to save Comment Prompt.");
    } finally {
      setIsLoadingComment(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-radial-aurora text-white bg-fixed">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* DM Prompt Form */}
          <div className="shadow-elegant p-6 rounded-lg bg-gradient-to-b from-white/3 to-white/2 backdrop-blur-md border border-white/20">
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
              {pageId && !dmEdit ? (
                <button
                  onClick={editDMPrompt}
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
                <button
                  onClick={() => setDmEdit(false)}
                  className={`mt-4 w-10 h-10 flex absolute right-4 top-2 items-center justify-center rounded-full 
    bg-gradient-to-r from-rose-600 to-red-500 text-white 
    hover:shadow-lg transition  cursor-pointer
    ${isLoadingDM ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label="Close"
                >
                  <X size={18} strokeWidth={2} className="text-white " />
                </button>
              )}
            </div>
            {!dmEdit ? (
              <div className="min-h-[200px] w-full p-4 rounded-md card-bg text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500  overflow-y-auto">
                {dmSystemPromt}
              </div>
            ) : (
              <textarea
                value={dmSystemPromt}
                onChange={(e) => setDmSystemPromt(e.target.value)}
                placeholder="Enter instructions for DM responses..."
                className="min-h-[200px] w-full p-4 rounded-md bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">
              Characters: {dmSystemPromt.length}
            </p>
            {dmEdit && (
              <div className="flex gap-8">
                <button
                  onClick={handleSaveDM}
                  disabled={isLoadingDM}
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-md hover:shadow-lg transition cursor-pointer"
                >
                  {isLoadingDM ? "Saving..." : "Save DM Prompt"}
                </button>
              </div>
            )}
          </div>

          {/* Comment Prompt Form */}
          <div className="shadow-elegant p-6 rounded-lg bg-gradient-to-b from-white/3 to-white/2  backdrop-blur-md border border-white/20">
            <div className="flex">
              <div className="w-2/3">
                <h2 className="text-xl font-bold text-green-400 mb-2">
                  Comment Prompt
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Instructions for how your bot should reply to post comments.
                </p>
              </div>
              {pageId && !cmtEdit ? (
                <button
                  onClick={editCmtPrompt}
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
                <button
                  onClick={() => setCmtEdit(false)}
                  className={`mt-4 w-10 h-10 flex absolute right-4 top-2 items-center justify-center rounded-full 
    bg-gradient-to-r from-rose-600 to-red-500 text-white 
    hover:shadow-lg transition  cursor-pointer
    ${isLoadingDM ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label="Close"
                >
                  <X size={18} strokeWidth={2} className="text-white " />
                </button>
              )}
            </div>
            {!cmtEdit ? (
              <div className="min-h-[200px] w-full p-4 rounded-md card-bg text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto">
                {cmntSystemPromt}
              </div>
            ) : (
              <textarea
                value={cmntSystemPromt}
                onChange={(e) => setCmntSystemPromt(e.target.value)}
                placeholder="Enter instructions for comment responses..."
                className="min-h-[200px] w-full p-4 rounded-md bg-black/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            )}
            <div className="text-xs text-gray-400 mt-1">
              Characters: {cmntSystemPromt.length}
            </div>
            {cmtEdit && (
              <button
                onClick={handleSaveComment}
                disabled={isLoadingComment}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-md hover:shadow-lg transition cursor-pointer"
              >
                {isLoadingComment ? "Saving..." : "Save Comment Prompt"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainPrompt;
