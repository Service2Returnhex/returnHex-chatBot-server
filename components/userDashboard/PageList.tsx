"use client";

import { PageInfo } from "@/app/types/user";
import { Eye, Trash } from "lucide-react";

type Props = {
  pages: PageInfo[];
  onDelete?: (id: string) => void;
  onOpen?: (pageId: string) => void;
};

export default function PagesList({ pages, onDelete, onOpen }: Props) {
  if (!pages.length) {
    return <div className="text-sm text-gray-400">No pages connected yet.</div>;
  }

  return (
    <div className="space-y-3  w-full">
      {pages.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between card-bg backdrop-blur rounded-xl p-3 "
        >
          <div>
            <div className="font-medium text-gray-100">{p.name}</div>
            <div className="text-xs text-gray-400">ID: {p.pageId}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-200">
              {p.tokensUsed ?? 0} used
            </div>
            <button
              onClick={() => onOpen?.(p.pageId)}
              className="p-2 rounded-md hover:bg-white/5 cursor-pointer"
              title="Open page"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(p.id)}
              className="p-2 rounded-md hover:bg-red-600/20 text-red-400 cursor-pointer"
              title="Delete page"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
