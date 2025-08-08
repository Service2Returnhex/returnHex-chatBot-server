// src/components/Navbar.tsx
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type NavbarProps = {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightNode?: React.ReactNode; // optional content on the right (buttons, avatar)
  className?: string; // additional container classes
  bgClass?: string; // background class to match page background (eg. "bg-gray-900/40")
};

export default function Navbar({
  title = "",
  showBack = true,
  backHref,
  rightNode,
  className = "",
  bgClass = "bg-white/15", // default semi-transparent light overlay; change for dark pages e.g. "bg-gray-900/50"
}: NavbarProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (backHref) {
      // prefer explicit href
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <nav
      aria-label={title ? `${title} navigation` : "main navigation"}
      className={`fixed left-0 right-0 top-4 z-50 flex justify-center ${className}`}
    >
      <div
        className={`mx-4 w-full max-w-6xl rounded-2xl px-4 py-2 backdrop-blur-md border border-white/6 shadow-sm flex items-center gap-4 ${bgClass}`}
      >
        {/* Left: Back button / Home link */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-white/8 bg-white/4 hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {/* Back arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 16L6 10l6-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex items-center gap-2"
            >
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-indigo-600 text-white font-semibold">
                AI
              </div>
            </Link>
          )}

          {/* Title (center-left) */}
          <div className="hidden sm:flex flex-col">
            {title ? (
              <>
                <span className="text-sm font-semibold text-white/90 leading-tight">
                  {title}
                </span>
                <span className="text-xs text-white/50">
                  Manage your chatbot
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Center: responsive title for small screens */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-base font-semibold text-white/95 sm:hidden">
            {title}
          </h1>
        </div>

        {/* Right: custom actions */}
        <div className="flex items-center gap-3">
          {rightNode ? (
            rightNode
          ) : (
            // default quick links (example)
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/dashboard/user"
                className="text-sm px-3 py-2 rounded-lg hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="text-sm px-3 py-2 rounded-lg hover:bg-white/6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
