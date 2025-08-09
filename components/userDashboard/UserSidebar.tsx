"use client";

import {
  BarChart2,
  Bot,
  Brain,
  CreditCard,
  Home,
  LayoutGrid,
  MessageSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const nav: NavItem[] = [
  {
    href: "/user-dashboard",
    label: "Overview",
    icon: <Home className="w-5 h-5" />,
  },
  {
    href: "/user-dashboard/pages",
    label: "Pages",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    href: "/user-dashboard/usage",
    label: "Token Usage",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    href: "/dashboard/user/billing",
    label: "Billing",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    href: "/user-dashboard/configure-bot",
    label: "Configuration Bot",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    href: "/user-dashboard/update-pageInfo",
    label: "Update PageInfo",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    href: "/user-dashboard/train-post",
    label: "Train Posts",
    icon: <Bot className="w-5 h-5" />,
  },
  {
    href: "/user-dashboard/train-prompt",
    label: "Train Prompt",
    icon: <MessageSquare className="w-5 h-5" />,
  },
];

type Props = {
  userName?: string;
  userEmail?: string;
  availableTokens?: number;
  onSignOut?: () => void;
  className?: string;
};

export default function UserSidebar({
  userName = "Fahim R.",
  userEmail = "fahim@example.com",
  availableTokens = 50000,
  onSignOut,
  className = "",
}: Props) {
  const pathname = usePathname() || "";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`w-72 bg-gradient-to-b from-white/3 to-white/2 backdrop-blur-md p-4 rounded-2xl min-h-screen fixed ${className}`}
      aria-label="User sidebar"
    >
      {/* User info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white font-medium">
          {userName
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {userName}
          </div>
          <div className="text-xs text-gray-300 truncate">{userEmail}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-3" aria-label="Main">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition 
                ${
                  active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-200 hover:bg-white/5"
                }
              `}
            >
              <span className={`${active ? "text-white" : "text-gray-300"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      {/* <div className="flex-1 mt-6" />

      <div className="mt-6 border-t border-white/5 pt-4 w-full absolute bottom-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-300">Available</div>
            <div className="text-lg font-semibold text-white">
              {availableTokens.toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Link
              href="/dashboard/user/usage"
              className="text-xs px-3 py-1 bg-white/5 rounded-md hover:bg-indigo-600 hover:text-white transition"
            >
              View Usage
            </Link>
            <button
              type="button"
              onClick={() => onSignOut?.()}
              className="text-xs px-3 py-1 rounded-md hover:bg-white/5 transition flex items-center gap-2 text-gray-200"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
