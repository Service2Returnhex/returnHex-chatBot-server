"use client"
import { JwtPayload } from "@/types/jwtPayload.type";
import { IPageInfo } from "@/types/pageInfo.type";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function PageCard() {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<IPageInfo[] | null>(null);
  const [totalPages, setTotalPages] = useState<number>();
  const [activePages, setActivePages] = useState<number>();


  useEffect(() => {
    let mounted = true;
    async function loadByOwner() {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Please login first");
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        const ownerId = decoded.userId ?? decoded._id ?? decoded.id;
        console.log("ownerid", ownerId);
        if (!ownerId) {
          toast.error("Could not get owner id from token");
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/`,
          {
            headers: {
              Authorization: `${token}`,
              "ngrok-skip-browser-warning": "69420"
            }
          }
        );

        if (!res.data.success) {
          toast.error(res.data.message || "Failed to load pages");
          return;
        }

        if (mounted) {
          const pages = res.data.data as IPageInfo[];
          setPages(pages);
          setTotalPages(pages.length)
          if (pages) {
            const activepagecount = pages.filter((p) => p.isStarted == true).length;
            setActivePages(activepagecount)
            console.log("activepagecount", activepagecount);
          }
        }
        console.log("active page", activePages);
      } catch (err: any) {
        console.error("loadByOwner error:", err);
        toast.error(err?.response?.data?.message || err?.message || "Could not load pages");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadByOwner();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card-bg p-5 rounded-lg shadow border border-gray-700 hover:shadow-md hover:shadow-gray-700 cursor-pointer">
          <p className="text-gray-400">Total Pages</p>
          <h2 className="text-2xl font-bold">{totalPages}</h2>
          <span className="text-xs text-gray-500">Configured bot pages</span>
        </div>
        <div className="card-bg p-5 rounded-lg shadow border border-gray-700 hover:shadow-md hover:shadow-gray-700 cursor-pointer">
          <p className="text-gray-400">Active Pages</p>
          <h2 className="text-2xl font-bold">{activePages}</h2>
          <span className="text-xs text-gray-500">Currently running</span>
        </div>
        <div className="card-bg p-5 rounded-lg shadow border border-gray-700 hover:shadow-md hover:shadow-gray-700 cursor-pointer">
          <p className="text-gray-400">Total Users</p>
          <h2 className="text-2xl font-bold">21</h2>
          <span className="text-xs text-gray-500">Registered users</span>
        </div>
      </div>
    </div>
  );
}
