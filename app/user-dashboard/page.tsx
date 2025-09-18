"use client";

import UserDahboard from "@/components/UserDahboard";
import PagesList from "@/components/userDashboard/PageList";
import TokenUsagePage from "@/components/userDashboard/TokenUsage";
import axios, { AxiosError } from "axios";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { PageInfo, TokenUsageResponse } from "../types/user";

const MOCK = {
  tokenUsage: {
    daily: {
      totalTokensAvailable: 50000,
      totalTokensUsed: 4125,
      range: "daily",
      points: [
        { date: "2025-08-03", tokens: 450 },
        { date: "2025-08-04", tokens: 610 },
        { date: "2025-08-05", tokens: 700 },
        { date: "2025-08-06", tokens: 550 },
        { date: "2025-08-07", tokens: 920 },
        { date: "2025-08-08", tokens: 645 },
        { date: "2025-08-09", tokens: 245 },
      ],
    },
    weekly: {
      totalTokensAvailable: 50000,
      totalTokensUsed: 7320,
      range: "weekly",
      points: [
        { date: "2025-W27", tokens: 1200 },
        { date: "2025-W28", tokens: 1800 },
        { date: "2025-W29", tokens: 4320 },
      ],
    },
  },
  pages: [
    {
      id: "p_01",
      name: "Fahim Electronics",
      pageId: "107823456789001",
      tokensUsed: 1245,
    },
    {
      id: "p_02",
      name: "Habiganj Travel",
      pageId: "107823456789002",
      tokensUsed: 3010,
    },
    {
      id: "p_03",
      name: "Quran Tutor Bot",
      pageId: "107823456789003",
      tokensUsed: 870,
    },
  ],
};

export default function UserDashboardPage() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [usage, setUsage] = useState<TokenUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"daily" | "weekly">("daily");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Logout error:", error?.response?.data || error?.message);
      // Even if API fails, clear storage and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    // simulate fetch + small delay
    setLoading(true);
    const t = setTimeout(() => {
      setUsage(MOCK.tokenUsage[range] as TokenUsageResponse);
      setPages(MOCK.pages as PageInfo[]);
      setLoading(false);
    }, 300); // 300ms fake delay
    return () => clearTimeout(t);
  }, [range]);

  // derived numbers
  const available = usage
    ? Math.max(0, usage.totalTokensAvailable - usage.totalTokensUsed)
    : 0;
  const used = usage ? usage.totalTokensUsed : 0;
  const points = usage ? usage.points : [];

  return (
    <div className="p-6 space-y-6 bg-radial-aurora text-white min-h-screen ">
      {/* <div className="lg:flex lg:gap-6  "> */}

      <div className="flex flex-col gap-8 ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* LEFT: Welcome text */}
          <div className="min-w-0 md:flex-1">
            <h1 className="text-lg sm:text-xl xl:text-3xl md:text-3xl font-bold text-white mb-1 leading-tight truncate">
              Welcome back,{" "}
              <span className="text-gradient inline-block max-w-[60ch] sm:max-w-[40ch] md:max-w-[30ch] truncate ">
                Mustafijur <span aria-hidden="true">👋</span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-prose">
              Here's an overview of your bot activity and usage statistics.
            </p>
          </div>

          {/* RIGHT: Logout / controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* On small screens make button full width (stacked under text) */}
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-semibold border border-white/20 hover:bg-white/8 transition bg-transparent text-sm sm:text-base"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-10 p-4">
           <div className="lg:col-span-3 w-full">
              <div className="flex items-center justify-between mb-3 ">
                <h3 className="text-sm text-gray-300">Active Pages</h3>
                <button
                  // onClick={fetchData}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Refresh
                </button>
              </div>

              <PagesList
                // pages={pages}
                //   onDelete={handleDeletePage}
                //   onOpen={handleOpenPage}
              />
            </div>
        
          <TokenUsagePage/>

          <div className="w-full">
            <UserDahboard />
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
