"use client";

import UserDahboard from "@/components/UserDahboard";
import PagesList from "@/components/userDashboard/PageList";
import TokenCard from "@/components/userDashboard/TokenCard";
import TokenChart from "@/components/userDashboard/TokenChart";
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
    <div className="p-0 space-y-6 bg-radial-aurora text-white min-h-screen ">
      {/* <div className="lg:flex lg:gap-6  "> */}

      <div className="flex flex-col gap-8 p-6">
        <div className="flex items-center justify-between gap-">
          <div className="w-2/3">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, Mustafijur Rahman Fahim ! 👋
            </h1>
            <p className="text-gray-300">
              Here's an overview of your bot activity and usage statistics.
            </p>
          </div>
          <button
            //    onClick={() => onSignOut?.()}
            //   variant="outline"
            className="border-white/20 border-1 py-2 px-4 rounded-xl text-white font-semibold hover:bg-white/10 flex items-center cursor-pointer"
          >
            <LogOut className="h-6 w-6 mr-2" />
            Logout
          </button>
        </div>
        <div className="flex flex-col gap-16 p-4">
          <div className="flex gap-8 justify-between w-full">
            <TokenCard
              available={available}
              used={used}
              monthlyLimit={usage ? usage.totalTokensAvailable : undefined}
            />
            <div className=" w-1/2">
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
                pages={pages}
                //   onDelete={handleDeletePage}
                //   onOpen={handleOpenPage}
              />
            </div>
          </div>

          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Token Usage</h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRange("daily")}
                  className={`px-3 py-1 rounded-md ${
                    range === "daily"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setRange("weekly")}
                  className={`px-3 py-1 rounded-md ${
                    range === "weekly"
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5"
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-6 bg-white/3 backdrop-blur rounded-2xl">
                Loading...
              </div>
            ) : (
              <TokenChart points={points} />
            )}
          </div>

          <UserDahboard />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
