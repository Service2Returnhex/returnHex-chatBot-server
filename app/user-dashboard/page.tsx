"use client";

import PagesList from "@/components/adminDashboard/PagesList";
import UserDahboard from "@/components/UserDahboard";
import TokenUsagePage from "@/components/userDashboard/TokenUsage";
import { JwtPayload } from "@/types/jwtPayload.type";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


export default function UserDashboardPage() {
  const [userName, setUserName] = useState<string>("");


  const onLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.error("Logout error:", error?.response?.data || error?.message);
      // Even if API fails, clear storage and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    // simulate fetch + small delay
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const decoded = jwtDecode<JwtPayload>(token);
    const userId = decoded.userId;

    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/users/${userId}`)
      .then((res) => {
        setUserName(res.data.data.name);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load user");
      });
  }, []);



  return (
    <div className="p-6 space-y-6 bg-radial-aurora text-white min-h-screen ">
      {/* <div className="lg:flex lg:gap-6  "> */}

      <div className="flex flex-col gap-8 ">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* LEFT: Welcome text */}
          <div className="min-w-0 md:flex-1">
            <h1 className="text-lg sm:text-xl xl:text-2 xl  font-bold text-white mb-1 leading-tight truncate">
              Welcome back,{" "}
              <span className="text-gradient inline-block max-w-[150px] sm:max-w-[210px] md:max-w-[310px] truncate ">
                {userName} <span aria-hidden="true">👋</span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-prose">
              Here's an overview of your bot activity and usage statistics.
            </p>
          </div>

          {/* RIGHT: Logout / controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* On small screens make button full width (stacked under text) */}
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white font-semibold border border-white/20 hover:bg-white/8 transition bg-transparent text-sm sm:text-base"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-10 p-4">
          <div className="lg:col-span-3 w-full">
            <div className="flex items-center justify-between mb-3 ">
              <h3 className="text-sm text-gray-300">Active Pages</h3>
              <button
                // onClick={fetchData}
                className="text-xs text-indigo-400 hover:underline"
              >
                Refresh
              </button>
            </div>

            <PagesList />
          </div>

          <TokenUsagePage />

          <div className="w-full">
            <UserDahboard />
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
