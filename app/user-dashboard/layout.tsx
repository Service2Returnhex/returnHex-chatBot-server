"use client";
import UserSidebar from "@/components/userDashboard/Sidebar";
import { JwtPayload } from "@/types/jwtPayload.type";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    // simulate fetch + small delay
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    if (!token) {
      router.replace("/login");
    }

    const decoded = jwtDecode<JwtPayload>(token);
    const userId = decoded.userId;

    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${userId}`)
      .then((res) => {
        setUserName(res.data.data.name);
        setUserEmail(res.data.data.email);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load user");
      });
  }, [router]);

  return (
    <section>
      <div className="bg-radial-aurora text-white min-h-screen flex">
        <div className="flex fixed top-2 left-2 items-center justify-between mb-6 lg:hidden">
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
              userName={userName}
              userEmail={userEmail}
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
        <div className="w-full ml-4 mt-4">{children}</div>
      </div>
    </section>
  );
}
