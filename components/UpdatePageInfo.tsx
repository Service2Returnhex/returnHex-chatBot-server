"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormField } from "./ui/FormField";

interface ShopInfo {
  shopId: string;
  pageName: string;
  address: string;
  phone: string;
  email: string;
  pageCategory: string;
  verifyToken: string;
  accessToken: string;
  moreInfo: string;
}

export default function UpdatePageInfo() {
  const router = useRouter();
  const [formData, setFormData] = useState<ShopInfo>({
    shopId: "",
    pageName: "",
    address: "",
    phone: "",
    email: "",
    pageCategory: "",
    verifyToken: "",
    accessToken: "",
    moreInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch existing data when pageId is provided
  const fetchPageInfo = async (id?: string) => {
    if (!id || (typeof id === "string" && id.trim() === "")) {
      toast.error("Please enter a valid Page ID");
      return;
    }
    localStorage.setItem("pageId", id);
    setIsLoadingData(true);
    try {
      const res = await axios.get<{ success: boolean; data: ShopInfo }>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${id}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      if (res.data.success) {
        const data = res.data?.data;

        setFormData({
          shopId: data.shopId || "",
          pageName: data.pageName || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          pageCategory: data.pageCategory || "",
          verifyToken: data.verifyToken || "",
          accessToken: data.accessToken || "",
          moreInfo: data.moreInfo || "",
        });
        toast.success("Page information loaded");
      } else {
        toast.error("Failed to load page info");
      }
    } catch {
      toast.error("Error fetching data. Check Page ID.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const savedPageId = localStorage.getItem("pageId");

    if (savedPageId) {
      setFormData((prev) => ({
        ...prev,
        shopId: savedPageId,
      }));
      fetchPageInfo(savedPageId);
    }
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${savedPageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((res) => {
        const { data } = res;
        // console.log("data", data);
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            shopId: data.shopId,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Handle input changes
  const handleChange = (name: keyof ShopInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update API
  const handleUpdate = async () => {
    const { shopId, ...rest } = formData;
    const payload = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== "")
    );
    setLoading(true);
    try {
      const res = await axios.patch<{ success: boolean }>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${shopId}`,
        payload
      );
      if (res.data.success) {
        toast.success("Page info updated");
        setFormData({
          shopId: "",
          pageName: "",
          address: "",
          phone: "",
          email: "",
          pageCategory: "",
          verifyToken: "",
          accessToken: "",
          moreInfo: "",
        });
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Error updating page info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-radial-aurora text-white container mx-auto">
      <div className=" px-8 sm:px-4 py-8  relative z-10 w-2/3 mx-auto">
        <div className="w-full  space-y-6 bg-gradient-to-b from-white/3 to-white/2  border border-white/50 filter bg-blur-sm p-4  backdrop-blur-xl transition-transform  rounded-2xl">
          <h2 className="text-xl font-bold bg-blue-600 bg-clip-text text-transparent">
            Update Page Info
          </h2>

          <div className="mb-6 space-y-2 p-4 bg-gray-500/50 backdrop-blur-md rounded-lg">
            <FormField
              label="Page ID"
              id="shopId"
              value={formData.shopId}
              onChange={(val) => handleChange("shopId", val)}
              placeholder="Enter your Page ID"
              required
            />
            <button
              type="button"
              onClick={() => fetchPageInfo(formData.shopId)}
              // disabled={isLoadingData || !formData.shopId.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded hover:scale-102
    transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-600 cursor-pointer"
            >
              {isLoadingData ? "Loading..." : "Load Page Info"}
            </button>
          </div>

          <div className="space-y-2">
            <FormField
              label="Page Name"
              id="pageName"
              value={formData.pageName}
              onChange={(val) => handleChange("pageName", val)}
              placeholder="Facebook page name"
            />
            <FormField
              label="Email"
              id="email"
              value={formData.email}
              onChange={(val) => handleChange("email", val)}
              placeholder="email"
            />
            <div className="flex gap-4 justify-center">
              <div className="flex-1">
                <FormField
                  label="Address"
                  id="address"
                  value={formData.address}
                  onChange={(val) => handleChange("address", val)}
                  placeholder="Business address"
                />
              </div>
              <div className="flex-1">
                <FormField
                  label="Phone"
                  id="phone"
                  value={formData.phone}
                  onChange={(val) => handleChange("phone", val)}
                  placeholder="Contact phone"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <div className="flex-1">
                <FormField
                  label="Page Category"
                  id="pageCategory"
                  value={formData.pageCategory}
                  onChange={(val) => handleChange("pageCategory", val)}
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="flex-1">
                <FormField
                  label="Verify Token"
                  id="verifyToken"
                  value={formData.verifyToken}
                  onChange={(val) => handleChange("verifyToken", val)}
                  placeholder="Your verify token"
                />
              </div>
            </div>
            <FormField
              label="Access Token"
              id="accessToken"
              value={formData.accessToken}
              onChange={(val) => handleChange("accessToken", val)}
              placeholder="Page access token"
            />
            <FormField
              label="More Information"
              id="moreInfo"
              value={formData.moreInfo}
              type="textarea"
              onChange={(val) => handleChange("moreInfo", val)}
              placeholder="e.g., Some extra details…"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="mt-6 w-full bg-green-600  text-white py-2 rounded disabled:opacity-50 hover:scale-[1.01]
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600 cursor-pointer"
          >
            {loading ? "Updating..." : "Update Page Info"}
          </button>
        </div>
      </div>
    </div>
  );
}
