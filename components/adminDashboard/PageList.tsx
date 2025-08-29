"use client";
import { motion } from "framer-motion";
import { Edit2, Eye, ToggleLeft, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

// Types
export type PageItem = {
  id: string;
  name: string;
  usedTokens: number;
  isActive: boolean;
  createdAt: string;
};

type Props = {
  pages?: PageItem[];
  onToggleActive?: (id: string, newState: boolean) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
};
const fmtTokens = (n: number) => n.toLocaleString();

export default function PagesList({
  pages = [],
  onToggleActive,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [pages, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const visible = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="conatiner bg-radial-aurora text-white p-8 rounded-2xl shadow-sm">
      {/* Header */}
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
              setQuery("");
              setCurrentPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
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
