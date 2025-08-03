"use client";

import axios from "axios";
import { useEffect, useState } from "react";

interface Shop {
  _id: string;
  pageName: string;
  address: string;
  phone: string;
  pageCategory: string;
  pageId: string;
}

export default function Admin() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await axios.get<{
          success: boolean;
          data: Shop[];
        }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        if (!res.data.success) {
          throw new Error("API returned success=false");
        }
        console.log("res", res.data.data);
        setShops(res.data.data);
      } catch (error) {
        console.error("Failed to fetch shops:", error);
        //   setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
    // console.log("page", fetchPage);
  }, []);
  if (loading) return <p>Loading shops…</p>;
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Shops</h1>
      {shops.length === 0 ? (
        <p>No shops found.</p>
      ) : (
        <ul className="space-y-2">
          {shops.map((shop) => (
            <li key={shop._id} className="p-4 border rounded hover:shadow">
              <h2 className="text-xl font-semibold">{shop.pageName}</h2>
              <p>
                <strong>Category:</strong> {shop.pageCategory}
              </p>
              <p>
                <strong>Address:</strong> {shop.address}
              </p>
              <p>
                <strong>Phone:</strong> {shop.phone}
              </p>
              <p>
                <strong>Shop ID:</strong> {shop.pageId}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
