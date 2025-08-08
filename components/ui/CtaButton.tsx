"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CtaButton() {
  const [showCTA, setShowCTA] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > document.body.scrollHeight / 2) {
        setShowCTA(true);
      } else {
        setShowCTA(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div>
      {showCTA && (
        <div
          className="fixed bottom-0 left-0 w-full bg-indigo-600 text-white shadow-lg
               flex justify-between items-center px-6 py-4
               transform transition-transform duration-300 ease-out z-50"
        >
          <span className="text-lg font-semibold">Ready to get started?</span>
          <button
            className="ml-4 bg-white text-indigo-600 px-4 py-2 rounded-md font-medium
                 hover:bg-gray-100 transition cursor-pointer"
            onClick={() => router.push("/configure-bot")}
          >
            Configure Bot
          </button>
        </div>
      )}
    </div>
  );
}
