"use client";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FormField } from "./ui/FormField";
import { jwtDecode } from "jwt-decode";
import { JwtPayload } from "@/types/jwtPayload.type";


export default function ChatbotUserSetupPage() {
  const [formData, setFormData] = useState({
    pageName: "",
    address: "",
    phone: "",
    email: "",
    pageCategory: "",
    pageId: "",
    verifyToken: "",
    accessToken: "",
    moreInfo: "",
  });

  const [webhookURL, setWebhookURL] = useState("");
  const [verifyWebHook, setVerifyWebHook] = useState(false);

  const [isStarted, setIsStarted] = useState<boolean | string>(false);

  const [isLoading, setIsLoading] = useState(false);

   const handleProvideInfo = async () => {
    setIsLoading(true);
        const token = localStorage.getItem("accessToken");

   let ownerId: string | null = null;
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);
      ownerId = decoded.userId ?? decoded._id ?? decoded.id ?? null;
      console.log("Decoded userId:", ownerId);
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop`,
        {
          ...formData,
          shopId: formData.pageId,
          ownerId:ownerId ?? undefined
        }
      );
      const generatedURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/meta-webhook/${formData.pageId}/webhook`;
      localStorage.setItem("webHookURL", generatedURL);
      setWebhookURL(generatedURL);

      toast.success("Webhook URL and Verify Token generated successfully.");
      localStorage.setItem("pageId", formData.pageId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const pageId = localStorage.getItem("pageId");
    const generatedURL = localStorage.getItem("webHookURL");
    setWebhookURL(generatedURL || "");
    console.log("pageid", pageId);

    try {
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${pageId}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        })
        .then((res) => {
          if (!res.data.success) {
            toast.error("Failed to load page info");
            return;
          }
          const payload = res.data.data;
          console.log("data", payload);
          setFormData({
            pageId: payload.shopId,
            pageName: payload.pageName,
            address: payload.address,
            phone: payload.phone,
            email: payload.email,
            pageCategory: payload.pageCategory,
            verifyToken: payload.verifyToken,
            accessToken: payload.accessToken || "",
            moreInfo: payload.moreInfo || "",
          });
          setIsStarted(payload?.isStarted)
          if (!payload.isVerified) {
            toast.error("Verify the webhook first!");
            return;
          }
          setVerifyWebHook(true);
        });
    } catch (error) {
      console.log(error);
      toast.error("Could not load page info");
    }
  }, []);

  const handleSendAccessToken = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      if (!data.data.isVerified) {
        toast.error("Verify the webhook first!");
        return;
      }
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`,
        {
          accessToken: formData.accessToken,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      toast.success("Access token submitted successfully.");
    } catch (err: any) {
      toast.error(
        err.response.data.message || "Failed to submit access token."
      );
    }
  };

  const shallowEqual = (obj1: any, obj2: any) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(
      (key) => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
    );
  };

  const handleStartApp = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      if (data.success) {
        const fethcedData = {
          pageName: data.data.pageName,
          address: data.data.address,
          phone: data.data.phone,
          email: data.data.email,
          pageCategory: data.data.pageCategory,
          pageId: data.data.shopId,
          moreInfo: data.data.moreInfo,
          verifyToken: data.data.verifyToken,
          accessToken: data.data.accessToken,
        };
        console.log(fethcedData, formData);
        console.log(shallowEqual(fethcedData, formData));
        const { data: pageData } = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`,
        {
          isStarted: true
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
        if (shallowEqual(fethcedData, formData) && pageData?.success) {
          toast.success("App Started");
          setIsStarted(true);
        } else {
          toast.error("Failed to start the app.");
        }
      } else {
        toast.error("Failed to start the app.");
      }
    } catch (err) {
      toast.error("Failed to start the app.");
    }
  };

  const handleStopApp = async () => {
    const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`,
        {
          isStarted: false
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

    if(data?.success) {
      setIsStarted(false)
      toast.warning("App Stopped")
    }
    else toast.error("App not stopped!");
  }
  return (
    <div className="min-h-screen w-full relative bg-radial-aurora text-white bg-fixed ">
      {/* <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at 10% 10%, rgba(70, 85, 110, 0.5) 0%, transparent 50%),
          radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.4) 0%, transparent 20%),
          radial-gradient(circle at 50% 10%, rgba(181, 184, 208, 0.3) 0%, transparent 20%)
        `,
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      /> */}
      {/* <Navigation title="Configure Bot" /> */}

      <div className="container mx-auto px-4 py-8 relative z-10 ">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side Form */}
          <div className="w-full  space-y-6 bg-gradient-to-b from-white/5 to-white/2   border border-white/50 filter bg-blur-xl p-4  backdrop-blur-xl transition-transform  rounded-2xl">
            <h2 className="text-xl font-bold bg-blue-500 bg-clip-text text-transparent">
              Bot configuration
            </h2>

            <FormField
              label="Page Name"
              id="pageName"
              value={formData.pageName}
              onChange={(val) => setFormData((f) => ({ ...f, pageName: val }))}
              placeholder="Enter your Facebook page name"
              required
            />
            <FormField
              label="Email"
              id="email"
              value={formData.email}
              onChange={(val) => setFormData((f) => ({ ...f, email: val }))}
              placeholder="Enter your email address"
              required
            />
            <div className="flex gap-4 justify-center">
              <div className="flex-1">
                <FormField
                  label="Address"
                  id="address"
                  value={formData.address}
                  onChange={(val) =>
                    setFormData((f) => ({ ...f, address: val }))
                  }
                  placeholder="Enter business address"
                  required
                />
              </div>

              <div className="flex-1">
                <FormField
                  label="Phone"
                  id="phone"
                  value={formData.phone}
                  onChange={(val) => setFormData((f) => ({ ...f, phone: val }))}
                  placeholder="Enter contact phone number"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <div className="flex-1">
                <FormField
                  label="Page Category"
                  id="pageCategory"
                  value={formData.pageCategory}
                  onChange={(val) =>
                    setFormData((f) => ({ ...f, pageCategory: val }))
                  }
                  placeholder="e.g., Electronic,Service"
                  required
                />
              </div>
              <div className="flex-1">
                <FormField
                  label="Page ID"
                  id="pageId"
                  value={formData.pageId}
                  onChange={(val) =>
                    setFormData((f) => ({ ...f, pageId: val }))
                  }
                  placeholder="Your Facebook page ID"
                  required
                />
              </div>
            </div>

            <FormField
              label="Verify Token"
              id="verifyToken"
              value={formData.verifyToken}
              onChange={(val) =>
                setFormData((f) => ({ ...f, verifyToken: val }))
              }
              placeholder="Your webhook verify token"
              required
            />
            <FormField
              label="More information"
              id="moreInformation"
              value={formData.moreInfo}
              type="textarea"
              onChange={(val) => setFormData((f) => ({ ...f, moreInfo: val }))}
              placeholder="e.g., Some extra details…"
            />

            <button
              onClick={handleProvideInfo}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-600 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Provide Info"}
            </button>

            {webhookURL && (
              <div className="bg-green-100 p-2 rounded text-black">
                <p>
                  <strong>Webhook URL:</strong> {webhookURL}
                </p>
                <p>
                  <strong>Verify Token:</strong> {formData.verifyToken}
                </p>
              </div>
            )}

            {verifyWebHook && (
              <>
                <p>
                  Note: If Webhook is configured then collect and submit the
                  access token and start the app
                </p>
                <div>
                  <FormField
                    label="Access Token"
                    id="accessToken"
                    value={formData.accessToken}
                    onChange={(val) =>
                      setFormData((f) => ({ ...f, accessToken: val }))
                    }
                    placeholder="Your page access token"
                    required
                  />

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSendAccessToken}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-purple-600  cursor-pointer"
                    >
                      Submit Access Token
                    </button>

                    <button
                      onClick={() => {
                        if(!isStarted) handleStartApp()
                        else handleStopApp()
                      }}
                      className={`${isStarted ? "bg-red-600 hover:shadow-red-600" : "bg-green-600 hover:shadow-green-600"} text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl   cursor-pointer`}
                    >
                    {isStarted ? "Stop App" : "Start App"}

                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Right Side Manual */}
          <div className="w-full bg-gradient-to-b from-white/3 to-white/2  border border-white/50 filter bg-blur-sm p-4  backdrop-blur-xl transition-transform  rounded-2xl">
            {/* Frosted backdrop */}
            {/* <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl" /> */}

            <div className="relative z-10 h-96 lg:h-full overflow-y-auto pr-4">
              <h2 className="text-xl font-bold bg-blue-500 bg-clip-text text-transparent mt">
                Facebook Chatbot Configuration Guide
              </h2>
              <ol className="list-decimal list-inside space-y-4 mt-2 text-md text-gray-300 leading-relaxed">
                <li>
                  Create a Facebook account:{" "}
                  <Link
                    href="https://facebook.com"
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    facebook.com
                  </Link>
                </li>
                <li>Create a Facebook Page if you don’t already have one.</li>
                <li>
                  Go to Meta for Developers:{" "}
                  <Link
                    href="https://developers.facebook.com"
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    developers.facebook.com
                  </Link>
                </li>
                <li>Create a new App (Business type preferred).</li>
                <li>Add Webhooks and Messenger products from the left menu.</li>
                <li>Navigate to App Settings – Basic. Fill out the form.</li>
                <li>
                  Generate a free Privacy Policy:{" "}
                  <Link
                    href="https://www.freeprivacypolicy.com"
                    target="_blank"
                    className="text-blue-400 hover:underline"
                  >
                    freeprivacypolicy.com
                  </Link>
                </li>
                <li>Switch App Mode to Live from the top navbar.</li>
                <li>Connect your Page under Messenger → API Settings.</li>
                <li>Copy the Page ID and submit it with the form.</li>
                <li>Use the generated Webhook URL & Verify Token for setup.</li>
                <li>
                  Subscribe to messaging events (messages, messaging_postbacks,
                  etc.).
                </li>
                <li>Use Graph API Explorer to generate an Access Token.</li>
                <li>Submit the token in the form and start the app.</li>
              </ol>

              <p className="text-lg mt-4 font-bold text-gray-200">
                📘 Detailed documentation:{" "}
                <Link
                  href="https://docs.google.com/document/d/1_eaQADKzvhlJxL2xGAZRO8lSDjiWsQ16_IREJHmzR-I/edit?usp=sharing"
                  target="_blank"
                  className="text-blue-400 hover:underline"
                >
                  View Full Guide
                </Link>
              </p>
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}