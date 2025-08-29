import PageCard from "@/components/adminDashboard/PageCard";
import PagesList from "@/components/adminDashboard/PagesList";
import TokenChart from "@/components/adminDashboard/TokenCharts";

export default function DashboardPage() {
  // const [tone, setTone] = useState("online");

  // derived numbers
  const tone = "online";
  const statusClasses =
    tone === "online"
      ? "bg-green-700 text-white"
      : tone === "warning"
      ? "bg-amber-600 text-black"
      : "bg-red-700 text-white";
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
              System Online
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
