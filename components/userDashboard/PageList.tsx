"use client";
import { Clipboard, MoreVertical } from "lucide-react";

const botPages = [
  {
    name: "TechStore Bot",
    pageId: "123456789",
    owner: "John Doe",
    token: "EAax••••••••••••xxxx",
    created: "1/15/2024",
    status: "active",
  },
  {
    name: "Restaurant Helper",
    pageId: "987654321",
    owner: "Jane Smith",
    token: "EAay••••••••••••yyyy",
    created: "1/10/2024",
    status: "active",
  },
  {
    name: "Support Bot",
    pageId: "456789123",
    owner: "Mike Johnson",
    token: "EAaz••••••••••••zzzz",
    created: "1/8/2024",
    status: "inactive",
  },
];
export default function PagesList() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // replace with toast if you use one
      // toast.success("Copied token");
      console.log("copied");
    } catch (err) {
      console.error("copy failed", err);
    }
  };
  return (
    <div>
      <div className="card-bg p-5 rounded-lg shadow border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Bot Pages Management</h2>

        {/* Desktop / tablet: table (md+) */}
        <div className="hidden md:block">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Page Name
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Page ID
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Owner
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Access Token
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Created
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Status
                  </th>
                  <th className="p-3 text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {botPages.map((page, idx) => (
                  <tr
                    key={page.pageId || idx}
                    className="border-b border-gray-800 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-3 align-top">
                      <div className="font-semibold text-white">
                        {page.name}
                      </div>
                    </td>

                    <td className="p-3 align-top text-sm text-gray-300">
                      {page.pageId}
                    </td>

                    <td className="p-3 align-top text-sm text-gray-300">
                      {page.owner}
                    </td>

                    <td className="p-3 align-top text-sm text-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="truncate max-w-[420px] block">
                          {page.token}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(page.token)}
                          className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5 cursor-pointer"
                          aria-label="Copy token"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    <td className="p-3 align-top text-sm text-gray-300">
                      {page.created}
                    </td>

                    <td className="p-3 align-top">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          page.status === "active"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {page.status}
                      </span>
                    </td>

                    <td className="p-3 align-top">
                      <button
                        type="button"
                        className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5 cursor-pointer"
                        aria-label="Open actions"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile: stacked cards (sm and down) */}
        <div className="md:hidden space-y-3">
          {botPages.map((page, idx) => (
            <article
              key={page.pageId || idx}
              className="bg-surface p-4 rounded-lg border border-gray-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white truncate">
                      {page.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        page.status === "active" ? "bg-green-600" : "bg-red-600"
                      }`}
                    >
                      {page.status}
                    </span>
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-300">
                    <div>
                      <dt className="text-xs text-gray-400">Page ID</dt>
                      <dd className="truncate">{page.pageId}</dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-400">Owner</dt>
                      <dd>{page.owner}</dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-400 flex items-center justify-between">
                        <span>Access Token</span>
                        <button
                          onClick={() => copyToClipboard(page.token)}
                          className="text-xs text-gray-300 hover:text-white/90 border border-gray-500 py-1 px-2 rounded-xl cursor-pointer"
                        >
                          Copy
                        </button>
                      </dt>
                      <dd className="truncate break-words max-w-full">
                        {page.token}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-gray-400">Created</dt>
                      <dd>{page.created}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <button
                    type="button"
                    className="p-2 rounded text-gray-300 hover:text-white/90 hover:bg-white/5"
                    aria-label="Open actions"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
