"use client";
import { motion } from "framer-motion";
import { Edit2, Eye, ToggleLeft, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Types
export type PageItem = {
  id: string;
  name: string;
  usedTokens: number; // total tokens used by this page
  isActive: boolean;
  createdAt: string; // ISO date
};

type Props = {
  pages?: PageItem[];
  onToggleActive?: (id: string, newState: boolean) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};
const mockPages = [
  {
    id: "page_1001",
    name: "Home Landing",
    usedTokens: 1240,
    isActive: true,
    createdAt: "2025-08-12T09:12:00.000Z",
  },
  {
    id: "page_1002",
    name: "Pricing",
    usedTokens: 980,
    isActive: true,
    createdAt: "2025-08-10T14:05:00.000Z",
  },
  {
    id: "page_1003",
    name: "Blog Index",
    usedTokens: 4520,
    isActive: true,
    createdAt: "2025-07-30T07:30:00.000Z",
  },
  {
    id: "page_1004",
    name: "Contact Us",
    usedTokens: 720,
    isActive: false,
    createdAt: "2025-08-01T16:45:00.000Z",
  },
  {
    id: "page_1005",
    name: "About Company",
    usedTokens: 2110,
    isActive: true,
    createdAt: "2025-07-25T11:00:00.000Z",
  },
  {
    id: "page_1006",
    name: "Feature A",
    usedTokens: 3320,
    isActive: true,
    createdAt: "2025-08-09T08:10:00.000Z",
  },
  {
    id: "page_1007",
    name: "Feature B",
    usedTokens: 2875,
    isActive: false,
    createdAt: "2025-06-15T12:20:00.000Z",
  },
  {
    id: "page_1008",
    name: "Docs - Quickstart",
    usedTokens: 14320,
    isActive: true,
    createdAt: "2025-05-03T05:00:00.000Z",
  },
  {
    id: "page_1009",
    name: "Docs - API",
    usedTokens: 19980,
    isActive: true,
    createdAt: "2025-04-28T10:30:00.000Z",
  },
  {
    id: "page_1010",
    name: "Terms & Privacy",
    usedTokens: 410,
    isActive: true,
    createdAt: "2025-03-12T09:00:00.000Z",
  },
  {
    id: "page_1011",
    name: "User Profile",
    usedTokens: 2780,
    isActive: false,
    createdAt: "2025-07-04T13:15:00.000Z",
  },
  {
    id: "page_1012",
    name: "Dashboard Overview",
    usedTokens: 6400,
    isActive: true,
    createdAt: "2025-08-11T21:40:00.000Z",
  },
  {
    id: "page_1013",
    name: "Settings",
    usedTokens: 930,
    isActive: true,
    createdAt: "2025-06-28T19:05:00.000Z",
  },
  {
    id: "page_1014",
    name: "Onboarding Step 1",
    usedTokens: 1580,
    isActive: true,
    createdAt: "2025-08-05T06:30:00.000Z",
  },
  {
    id: "page_1015",
    name: "Onboarding Step 2",
    usedTokens: 1700,
    isActive: false,
    createdAt: "2025-08-06T06:32:00.000Z",
  },
  {
    id: "page_1016",
    name: "Pricing Promo A",
    usedTokens: 5200,
    isActive: true,
    createdAt: "2025-07-18T15:22:00.000Z",
  },
  {
    id: "page_1017",
    name: "Campaign - Summer",
    usedTokens: 8810,
    isActive: true,
    createdAt: "2025-06-05T04:10:00.000Z",
  },
  {
    id: "page_1018",
    name: "Legal - Disclosures",
    usedTokens: 360,
    isActive: true,
    createdAt: "2025-02-02T08:00:00.000Z",
  },
  {
    id: "page_1019",
    name: "FAQ",
    usedTokens: 1200,
    isActive: true,
    createdAt: "2025-07-01T09:45:00.000Z",
  },
  {
    id: "page_1020",
    name: "Legacy Page",
    usedTokens: 45000,
    isActive: false,
    createdAt: "2024-12-20T22:10:00.000Z",
  },
];

// Helper: pretty format
const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
};

const fmtTokens = (n: number) => n.toLocaleString();

// Main component
export default function PagesList({
  pages = [],
  onToggleActive,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState<PageItem[]>(mockPages);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const perPage = 10;
  useEffect(() => {
    setPage(page.length ? page : mockPages);
  }, [page]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return page;
    return page.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [page, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="conatiner bg-radial-aurora text-white p-8 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">All Pages</h2>
          <p className="text-sm text-slate-500">
            Manage pages, tokens used and activation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or id..."
            className="px-3 py-2 border rounded-md w-60 focus:outline-none"
          />

          <button
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => {
              // Example action: reset filters
              setQuery("");
              setCurrentPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-4 card-bg rounded-2xl shadow-md shadow-gray-800">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-sm text-slate-200 text-left">
              <th className="py-2 px-3">Page ID</th>
              <th className="py-2 px-3">Page Name</th>
              <th className="py-2 px-3">Used Tokens</th>
              <th className="py-2 px-3">Active</th>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-sm text-slate-500"
                >
                  No pages found.
                </td>
              </tr>
            )}

            {visible.map((p) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="border-t"
              >
                <td className="py-3 px-3 text-sm font-mono text-slate-200">
                  {p.id}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium">{p.name}</div>
                </td>
                <td className="py-3 px-3 text-sm">
                  {fmtTokens(p.usedTokens)} tokens
                </td>
                <td className="py-3 px-3">
                  <button
                    title={p.isActive ? "Deactivate" : "Activate"}
                    className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-gray-800 ${
                      p.isActive
                        ? "bg-green-50 border-green-500 cursor-pointer"
                        : "bg-slate-50 border-red-400 cursor-pointer"
                    }`}
                    onClick={() =>
                      onToggleActive && onToggleActive(p.id, !p.isActive)
                    }
                  >
                    <ToggleLeft size={16} />
                    <span className="text-sm">
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                </td>
                <td className="py-3 px-3 text-sm text-slate-200">
                  {fmtDate(p.createdAt)}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView && onView(p.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:text-gray-800 hover:bg-slate-50 cursor-pointer"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>

                    <button
                      onClick={() => onEdit && onEdit(p.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:text-gray-800 hover:bg-slate-50 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => onDelete && onDelete(p.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:bg-red-50 text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">{total} pages total</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-3 py-1 border rounded-md">
            {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Demo export (optional) ---
export const PagesListDemo = () => {
  const [data, setData] = useState<PageItem[]>(() => {
    // sample mock data
    const now = new Date();
    return Array.from({ length: 23 }).map((_, i) => ({
      id: `page_${(1000 + i).toString(36)}`,
      name: `Landing Page ${i + 1}`,
      usedTokens: Math.floor(Math.random() * 20000) + 100,
      isActive: Math.random() > 0.4,
      createdAt: new Date(now.getTime() - i * 86400000).toISOString(),
    }));
  });

  const handlers = {
    onToggleActive: (id: string, next: boolean) => {
      setData((d) =>
        d.map((p) => (p.id === id ? { ...p, isActive: next } : p))
      );
    },
    onView: (id: string) => alert("View " + id),
    onEdit: (id: string) => alert("Edit " + id),
    onDelete: (id: string) => setData((d) => d.filter((p) => p.id !== id)),
  };

  return <PagesList pages={data} {...handlers} />;
};
