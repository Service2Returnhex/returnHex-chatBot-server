"use client"
import { IPageInfo } from "@/types/pageInfo.type";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PageActions = ({ page, onEdit, onView }: {
    page: IPageInfo;
    onEdit: (page: IPageInfo) => void;
    onView: (page: IPageInfo) => void;
}) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);


    const onToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen((s) => !s);
    };

    const handleEdit = () => {
        setOpen(false);
        if (onEdit) return onEdit(page);
        router.push(`/admin-dashboard/update-pageInfo/${page.shopId}`);
    };

    const handleView = () => {
        setOpen(false);
        if (onView) return onView(page);
        router.push(`/admin-dashboard/pages/${page.shopId}`);
    };

    useEffect(() => {
        const handleOutside = (e: Event) => {
            if (!open) return;

            // Prefer composedPath for correct detection across shadow DOM / portals
            const path = (e as any).composedPath ? (e as any).composedPath() : (e as any).path;

            if (path && Array.isArray(path)) {
                // if any node in path is wrapperRef or menuRef, it's an inside click -> keep open
                if (wrapperRef.current && path.includes(wrapperRef.current)) return;
                if (menuRef.current && path.includes(menuRef.current)) return;
                setOpen(false);
                return;
            }

            // fallback: normal contains check
            const target = e.target as Node | null;
            if (wrapperRef.current && wrapperRef.current.contains(target)) return;
            if (menuRef.current && menuRef.current.contains(target)) return;
            setOpen(false);
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("touchstart", handleOutside);
        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("touchstart", handleOutside);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    return (
        <div className="relative cursor-pointer">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="p-1 rounded text-gray-400 hover:text-white/90 hover:bg-white/5"
                aria-label="Open actions"
            >
                <MoreVertical className="h-5 w-5" />
            </button>

            {open && (
                <div className="absolute right-0 top-5 mt-2 w-36 rounded-lg bg-gray-800 border border-gray-700 shadow-lg z-50">
                    <button
                        onClick={handleEdit}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-t-lg"
                    >
                        ✏️ Edit Page
                    </button>
                    <button
                        onClick={handleView}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-b-lg"
                    >
                        👁️ View Page
                    </button>
                </div>
            )}
        </div>
    );
};

export default PageActions;
