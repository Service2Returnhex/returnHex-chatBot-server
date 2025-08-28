"use client";

import { TokenUsagePoint } from "@/app/types/user";
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
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Props = {
  points: TokenUsagePoint[]; // { date, tokens }
  label?: string;
};

export default function TokenChart({ points, label = "Tokens" }: Props) {
  const labels = useMemo(() => points.map((p) => p.date), [points]);
  const dataPoints = useMemo(() => points.map((p) => p.tokens), [points]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label,
          data: dataPoints,
          fill: true,
          tension: 0.2,
          backgroundColor: "rgba(99,102,241,0.12)",
          borderColor: "rgba(99,102,241,1)",
          pointRadius: 3,
        },
      ],
    }),
    [labels, dataPoints, label]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index" as const, intersect: false },
      },
      interaction: { mode: "nearest" as const, intersect: false },
      scales: {
        x: {
          grid: { display: false },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  return (
    <div className="bg-[#020817] backdrop-blur-md p-4 rounded-2xl">
      <Line data={data} options={options} />
    </div>
  );
}
