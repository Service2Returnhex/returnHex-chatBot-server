"use client";
import { PageInfo } from "@/app/types/user";
import { useEffect, useState } from "react";
import Chart from "./Chart";

type TokenUsagePoint = { date: string; tokens: number };
type TokenUsageResponse = {
  totalTokensAvailable: number;
  totalTokensUsed: number;
  range?: string;
  points: TokenUsagePoint[];
};

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
        { date: "2025-W30", tokens: 4310 },
        { date: "2025-W31", tokens: 4120 },
        { date: "2025-W32", tokens: 4520 },
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

export default function TokenChart() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [usage, setUsage] = useState<TokenUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"daily" | "weekly">("daily");

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
  const available = usage
    ? Math.max(0, usage.totalTokensAvailable - usage.totalTokensUsed)
    : 0;
  const used = usage ? usage.totalTokensUsed : 0;
  const points = usage ? usage.points : [];
  return (
    <div>
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Token Usage</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRange("daily")}
              className={`px-3 py-1 rounded-md ${
                range === "daily"
                  ? "bg-indigo-600 text-white cursor-pointer"
                  : "bg-white/5 cursor-pointer"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setRange("weekly")}
              className={`px-3 py-1 rounded-md ${
                range === "weekly"
                  ? "bg-indigo-600 text-white cursor-pointer"
                  : "bg-white/5 cursor-pointer"
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
          <Chart points={points} />
        )}
      </div>
    </div>
  );
}
