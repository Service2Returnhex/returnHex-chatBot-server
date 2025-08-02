"use client";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type ShopInfo = {
  shopId: string;
  pageName: string;
  address: string;
  phone: string;
  pageCategory: string;
  verifyToken: string;
  accessToken: string;
};

export default function UpdatePageInfoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ShopInfo>({
    shopId: "",
    pageName: "",
    address: "",
    phone: "",
    pageCategory: "",
    verifyToken: "",
    accessToken: "",
  });

  // 1️⃣ Fetch on mount
  useEffect(() => {
    async function load() {
      const savedId = localStorage.getItem("pageId");
      if (!savedId) {
        toast.error("No pageId in localStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get<{
          success: boolean;
          data: ShopInfo;
        }>(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${savedId}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!res.data.success) {
          throw new Error("API responded with success=false");
        }

        // Populate formData from API
        setFormData(res.data.data);
      } catch (err) {
        console.error("Failed to load page info:", err);
        toast.error("Could not load page info.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // 2️⃣ Controlled input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // 3️⃣ PATCH back only non-empty (or changed) fields
  const handleUpdate = async () => {
    const { shopId, ...rest } = formData;
    // remove blank fields
    const payload = Object.fromEntries(
      Object.entries(rest).filter(([_, v]) => v !== "")
    );

    try {
      const res = await axios.patch<{ success: boolean }>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${shopId}`,
        payload
      );
      if (res.data.success) {
        toast.success("Page info updated");
        setFormData({
          shopId: shopId,
          pageName: "",
          address: "",
          phone: "",
          pageCategory: "",
          verifyToken: "",
          accessToken: "",
        });
      } else {
        toast.error("Update failed on server");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Could not update page info");
    }
  };

  if (loading) {
    return <p className="p-6">Loading page info…</p>;
  }

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-4 hover:underline"
      >
        <ArrowLeft className="text-blue-500" />
        <span className="text-blue-500">Back</span>
      </button>

      <h2 className="text-2xl font-bold mb-4">Update Page Info</h2>

      {/* shopId is read-only */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Page ID</label>
        <input
          type="text"
          name="shopId"
          value={formData.shopId}
          readOnly
          className="mt-1 w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Other editable fields */}
      {[
        { key: "pageName", label: "Page Name" },
        { key: "address", label: "Address" },
        { key: "phone", label: "Phone" },
        { key: "pageCategory", label: "Page Category" },
        { key: "verifyToken", label: "Verify Token" },
        { key: "accessToken", label: "Access Token" },
      ].map(({ key, label }) => (
        <div className="mb-4" key={key}>
          <label className="block text-sm font-medium">{label}</label>
          <input
            type="text"
            name={key}
            value={formData[key as keyof ShopInfo]}
            onChange={handleChange}
            className="mt-1 w-full border rounded p-2"
          />
        </div>
      ))}

      <button
        onClick={handleUpdate}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Update Page Info
      </button>
    </div>
  );
}
