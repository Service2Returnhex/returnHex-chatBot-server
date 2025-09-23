import PageCard from "@/components/adminDashboard/PageCard";
import PagesList from "@/components/adminDashboard/PagesList";
import TokenChart from "@/components/adminDashboard/TokenCharts";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";


type Props = {
  status?: "online" | "degraded" | "offline";
};
export default function DashboardPage({ status = "online" }: Props) {

  const getStatusClasses = () => {
    switch (status) {
      case "online":
        return "bg-emerald-600 text-white";
      case "degraded":
        return "bg-yellow-500 text-black";
      case "offline":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const statusClasses = getStatusClasses();
  return (
    <div className="p-6 space-y-6 bg-radial-aurora text-white min-h-screen ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: title + subtitle */}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-3 leading-tight truncate">
            <span className="flex items-center gap-2 min-w-0">
              <span className="truncate">Admin Dashboard </span>
              <span aria-hidden>🛡️</span>
            </span>
          </h1>

          <p className="mt-1 text-sm sm:text-base text-gray-400 max-w-[80ch]">
            Manage all Facebook bot configurations and monitor system-wide
            activity.
          </p>

          {/* On very small devices show status below title (keeps layout compact) */}
          <div className="mt-3 md:hidden">
            <span
              role="status"
              aria-live="polite"
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusClasses}`}
            >
              System Online
            </span>
          </div>
        </div>

        {/* Right: status (md+) and optional actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* status visible on md+ */}
          <div className="hidden md:block">
            <span
              role="status"
              aria-live="polite"
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusClasses}`}
            >
              {status === "online" ? <FiCheckCircle className="mr-2" /> : <FiAlertCircle className="mr-2" />}
              {status === "online" ? "System Online" : status === "degraded" ? "Degraded" : "Offline"}
            </span>
          </div>

          {/* {actions ? <div className="w-full md:w-auto">{actions}</div> : null} */}
        </div>
      </div>

      {/* Stats */}
      <PageCard />
      <PagesList />
      <TokenChart />
    </div>
  );
}
