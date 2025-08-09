"use client";
import UserSidebar from "@/components/userDashboard/UserSidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <section>
      <div className="bg-radial-aurora text-white min-h-screen flex">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="p-2 rounded-md bg-white/5"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="lg:flex lg:gap-6  ">
          <div className={`hidden lg:block w-72 min-h-screen`}>
            <UserSidebar
              userName="Mustafijur Rahman Fahim"
              availableTokens={50000}
            />
          </div>
          {sidebarOpen && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex lg:hidden"
            >
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative w-72 p-4">
                <UserSidebar
                  userName="Mustafijur Rahman Fahim"
                  availableTokens={50000}
                  onSignOut={() => {
                    /* implement sign-out */
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* <UserSidebar /> */}
        </div>
        <div className="w-full">{children}</div>
      </div>
    </section>
  );
}
