"use client";

import TokenCard from "@/components/userDashboard/TokenCard";
import { useMsgCounts } from "@/hooks/useCountAvilableMsg";
import useFetchUsage, { Options } from "@/hooks/useFetchUsage";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
// import axios from "@/lib/axiosInstance"; // uncomment for real API

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title
);

type TokenUsagePoint = { date: string; tokens: number };
type TokenUsageResponse = {
  totalTokensAvailable: number;
  totalTokensUsed: number;
  range?: string;
  points: TokenUsagePoint[];
};

// --- Mock data (use local mock while building)
const MOCK: Record<"daily" | "weekly", TokenUsageResponse> = {
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
      { date: "2025-W30", tokens: 1420 },
      { date: "2025-W31", tokens: 1320 },
    ],
  },
};

export default function TokenUsagePage({ shopIdProp }: { shopIdProp?: string }) {
  const shopId = shopIdProp ?? "714401141759522";
  // console.log("shop id",shopId);
   const { tData, tLoading, tError, refetch } = useMsgCounts("714401141759522");

   console.log("tData",tData);
      // const totalPoints = tData?. ?? [];
  const totalUsed = tData?.totalUsage ?? 0;
  const totalAvailable = tData?.totalTokensAvailable ?? 0;

  // const shopId = shopIdProp ?? "714401141759522";
const [range, setRange] = useState<"daily" | "weekly" | "month-week">("daily");
const opts: Options =
  range === "daily"
    ? { range: "daily", days: 7 }
    :range === "weekly"? { range: "weekly", weeks: 7 }:{ range: "month-week", months: 5 };

    // range === "daily" ? "Daily messages" : range === "weekly" ? "Weekly messages" : "Month-week messages",

  const [usage, setUsage] = useState<TokenUsageResponse | null>(null);
  // const [loading, setLoading] = useState(false);

const { data, loading, error } = useFetchUsage(shopId, opts);

  console.log("range",range);
  console.log("opts",opts);
  console.log("data",data);
   const points = data?.points ?? [];
  const used = data?.totalTokensUsed ?? 0;
  const available = data?.totalTokensAvailable ? data.totalTokensAvailable - used : 0;
  console.log("available",available);
  console.log("points",points);

  // const chartData = {
  //   labels: points.map(p => p.date),
  //   datasets: [{ label: "Messages", data: points.map(p => p.msg), fill: true, tension: 0.25 }]
  // };
  // console.log("chartData",chartData);

  // on mount / range change fetch data (using mock now)
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       // --- Replace this block with real API call when ready ---
  //       // const res = await axios.get<TokenUsageResponse>(`/api/v1/user/token-usage?range=${range}`);
  //       // setUsage(res.data);
  //       await new Promise((r) => setTimeout(r, 250)); // small delay to simulate network
  //       setUsage(MOCK[range]);
  //     } catch (err: any) {
  //       console.error(err);
  //       toast.error("Failed to load token usage.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [range]);

  // const available = usage
  //   ? Math.max(0, usage.totalTokensAvailable - usage.totalTokensUsed)
  //   : 0;
  // const used = usage ? usage.totalTokensUsed : 0;
  // const points = usage ? usage.points : [];

  // // prepare chart data
  // const chartData = useMemo(() => {
  //   const labels = points.map((p) => p.date);
  //   const dataPoints = points.map((p) => p.tokens);
  //   return {
  //     labels,
  //     datasets: [
  //       {
  //         label: `${range === "daily" ? "Daily" : "Weekly"} tokens`,
  //         data: dataPoints,
  //         fill: true,
  //         tension: 0.25,
  //         backgroundColor: "rgba(99,102,241,0.12)",
  //         borderColor: "rgba(99,102,241,1)",
  //         pointRadius: 3,
  //       },
  //     ],
  //   };
  // }, [points, range]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index" as const, intersect: false },
        title: { display: false },
      },
      interaction: { mode: "nearest" as const, intersect: false },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.04)" },
        },
      },
    }),
    [points, range]
  );

  const chartData = useMemo(() => {
  const labels = points.map(p => p.date);
  const dataPoints = points.map(p => p.msg);
  return {
    labels,
    datasets: [{
      label: range === "daily" ? "Daily messages" : range === "weekly" ? "Weekly messages" : "Month-week messages",
      data: dataPoints,
      fill: true,
      tension: 0.25,
       backgroundColor: "rgba(99,102,241,0.12)",
          borderColor: "rgba(99,102,241,1)",
          pointRadius: 3,
    }]
  };
}, [points, range]);

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Token Usage</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRange("daily")}
            className={`px-3 py-1 rounded-md ${
              range === "daily"
                ? "bg-indigo-600 text-white"
                : "bg-white/5 text-gray-200"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setRange("weekly")}
            className={`px-3 py-1 rounded-md ${
              range === "weekly"
                ? "bg-indigo-600 text-white"
                : "bg-white/5 text-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setRange("month-week")}
            className={`px-3 py-1 rounded-md ${
              range === "month-week"
                ? "bg-indigo-600 text-white"
                : "bg-white/5 text-gray-200"
            }`}
          >
            Month-week
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 w-full">
          <TokenCard
            available={totalAvailable}
            totalUsed={totalUsed}
            monthlyLimit={totalAvailable}
            used={used}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="card-bg backdrop-blur-md p-4 rounded-2xl">
            {loading ? <div>Loading…</div> : error ? <div className="text-red-500">{error}</div> :error ? <div className="text-red-500">{error}</div> :  (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium">
                      {range === "daily" ? "Daily usage" : "Weekly usage"}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Shows tokens used per {range === "daily" ? "day" : "week"}
                      .
                    </p>
                  </div>
                </div>

                <div>
                  <Line data={chartData}  options={chartOptions}/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
