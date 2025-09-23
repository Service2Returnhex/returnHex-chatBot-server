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

export default function TokenUsagePage(params: any) {
    const shopId = localStorage.getItem("pageId")
    console.log("params", params.id);
    // console.log("shop id",shopId);
    const { tData, tLoading, tError, refetch } = useMsgCounts(params.id);

    const totalUsed = tData?.totalUsage ?? 0;
    const totalAvailable = tData?.totalTokensAvailable ?? 0;

    // const shopId = shopIdProp ?? "714401141759522";
    const [range, setRange] = useState<"daily" | "weekly" | "month-week">("daily");
    const opts: Options =
        range === "daily"
            ? { range: "daily", days: 7 }
            : range === "weekly" ? { range: "weekly", weeks: 7 } : { range: "month-week", months: 5 };

    // range === "daily" ? "Daily messages" : range === "weekly" ? "Weekly messages" : "Month-week messages",

    const [usage, setUsage] = useState<TokenUsageResponse | null>(null);
    // const [loading, setLoading] = useState(false);

    const { data, loading, error } = useFetchUsage(params.id, opts);

    const points = data?.points ?? [];
    const used = data?.totalTokensUsed ?? 0;
    const available = data?.totalTokensAvailable ? data.totalTokensAvailable - used : 0;
    console.log("available", available);

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
                <h1 className="text-2xl font-semibold">Message Usage</h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setRange("daily")}
                        className={`px-3 py-1 rounded-md ${range === "daily"
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-gray-200"
                            }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setRange("weekly")}
                        className={`px-3 py-1 rounded-md ${range === "weekly"
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 text-gray-200"
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setRange("month-week")}
                        className={`px-3 py-1 rounded-md ${range === "month-week"
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
                        available={available}
                        totalUsed={totalUsed}
                        monthlyLimit={totalAvailable}
                        used={used}
                    />
                </div>

                <div className="lg:col-span-3">
                    <div className="card-bg backdrop-blur-md p-4 rounded-2xl">
                        {loading ? <div>Loading…</div> : error ? <div className="text-red-500">{error}</div> : error ? <div className="text-red-500">{error}</div> : (
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-medium">
                                            {range === "daily" ? "Daily usage" : "Weekly usage"}
                                        </h2>
                                        <p className="text-xs text-gray-400">
                                            Shows Messages used per {range === "daily" ? "day" : "week"}
                                            .
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
