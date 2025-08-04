"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { FormField } from "../components/ui/FormField";
import Navigation from "../components/ui/Navigation";

export default function ChatbotUserSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pageName: "",
    address: "",
    phone: "",
    email: "",
    pageCategory: "",
    pageId: "",
    verifyToken: "",
    accessToken: "",
    moreInformatio: "",
  });
  const [webhookURL, setWebhookURL] = useState("");
  const [verifyStatus, setVerifyStatus] = useState("");
  const [startStatus, setStartStatus] = useState("");
  //   useEffect(() => {
  //     axios
  //       .get(
  //         `http://localhost:5002/api/v1/page/shop/${localStorage.getItem(
  //           "pageId"
  //         )}`
  //       )
  //       .then((res) => {
  //         const { data } = res;
  //         if (data.success) {
  //     console.log(data.data.pageName);

  //           setFormData({
  //             pageName: data.data.pageName,
  //             address: data.data.address,
  //             phone: data.data.phone,
  //             pageCategory: data.data.pageCategory,
  //             pageId: data.data.shopId,
  //             verifyToken: data.data.verifyToken,
  //             accessToken: data.data.accessToken,
  //           });
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   },[]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const [isLoading, setIsLoading] = useState(false);
  const handleProvideInfo = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop`,
        {
          ...formData,
          shopId: formData.pageId,
        }
      );
      const generatedURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/meta-webhook/${formData.pageId}/webhook`;
      setWebhookURL(generatedURL);
      setVerifyStatus("Webhook URL and Verify Token generated successfully.");
      toast.success("Webhook URL and Verify Token generated successfully.");
      localStorage.setItem("pageId", formData.pageId);
    } catch (err) {
      setVerifyStatus("Failed to send info. Please check and try again.");
      toast.error("Failed to send info. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAccessToken = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`,
        {
          accessToken: formData.accessToken,
        }
      );
      setVerifyStatus("Access token submitted successfully.");
      toast.success("Access token submitted successfully.");
    } catch (err) {
      setVerifyStatus("Failed to submit access token.");
      toast.error("Failed to submit access token.");
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/page/shop/${formData.pageId}`
      );
      if (data.success) {
        const fethcedData = {
          pageName: data.data.pageName,
          address: data.data.address,
          phone: data.data.phone,
          pageCategory: data.data.pageCategory,
          pageId: data.data.shopId,
          verifyToken: data.data.verifyToken,
          accessToken: data.data.accessToken,
        };
        shallowEqual(fethcedData, formData)
          ? toast.success("App Started")
          : toast.error("Failed to start the app.");
        setStartStatus("App Started");
      } else {
        toast.error("Failed to start the app.");
        setStartStatus("Failed to start the app.");
      }
    } catch (err) {
      toast.error("Failed to start the app.");
      setStartStatus("Failed to start the app.");
    }
  };

  const userManual = `


1. Create a Facebook App
   - Go to Facebook Developers (developers.facebook.com)
   - Create a new app for your business
   - Select "Business" as the app type

2. Add Messenger Product
   - In your app dashboard, add the "Messenger" product
   - Generate a Page Access Token for your Facebook page

3. Set Up Webhook
   - Add your webhook URL (your server endpoint)
   - Use the verify token you set in this form
   - Subscribe to messaging events

4. Page Information
   - Page Name: Your Facebook page name
   - Address: Physical address of your business
   - Phone: Contact phone number
   - Page Category: Type of business (e.g., Restaurant, Retail)
   - Page ID: Your Facebook page ID (found in page settings)

5. Authentication Tokens
   - Verify Token: A secret token you create for webhook verification
   - Access Token: Page Access Token from Facebook Developers

6. Testing
   - Send a test message to your page
   - Check webhook receives the message
   - Verify bot responds correctly

Important Notes:
- Keep your tokens secure and never share them publicly
- Test in a development environment first
- Ensure your webhook URL is HTTPS
- Subscribe to necessary webhook events (messages, messaging_postbacks)
`;

  return (
    <div className="min-h-screen w-full relative bg-gray-900 text-white bg-fixed ">
      <div
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
      />
      <Navigation title="Configure Bot" />

      <div className="container mx-auto px-4 py-8 relative z-10 ">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side Form */}
          <div className="w-full  space-y-6 bg-gray-500/20  border border-white/50 filter bg-blur-sm p-4  backdrop-blur-xl transition-transform  rounded-2xl">
            <h2 className="text-xl font-bold bg-blue-600 bg-clip-text text-transparent">
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
              label="Address"
              id="address"
              value={formData.address}
              onChange={(val) => setFormData((f) => ({ ...f, address: val }))}
              placeholder="Enter business address"
              required
            />

            <FormField
              label="Phone"
              id="phone"
              value={formData.phone}
              onChange={(val) => setFormData((f) => ({ ...f, phone: val }))}
              placeholder="Enter contact phone number"
              required
            />
            <FormField
              label="Email"
              id="email"
              value={formData.phone}
              onChange={(val) => setFormData((f) => ({ ...f, email: val }))}
              placeholder="Enter your email address"
              required
            />

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

            <FormField
              label="Page ID"
              id="pageId"
              value={formData.pageId}
              onChange={(val) => setFormData((f) => ({ ...f, pageId: val }))}
              placeholder="Your Facebook page ID"
              required
            />

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
              value={formData.verifyToken}
              onChange={(val) =>
                setFormData((f) => ({ ...f, moreInformatio: val }))
              }
              placeholder="e.g., Some extra details…"
              required
            />

            <button
              onClick={handleProvideInfo}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-600 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Provide Info"}
            </button>

            {webhookURL && (
              <div className="bg-green-100 p-2 rounded">
                <p>
                  <strong>Webhook URL:</strong> {webhookURL}
                </p>
                <p>
                  <strong>Verify Token:</strong> {formData.verifyToken}
                </p>
              </div>
            )}
            <p>
              Note: If Webhook is configured then collect and submit the access
              token and start the app
            </p>
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

            <div className="flex gap-2">
              <button
                onClick={handleSendAccessToken}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-purple-600  cursor-pointer"
              >
                Submit Access Token
              </button>

              <button
                onClick={handleStartApp}
                className="bg-green-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-green-600  cursor-pointer"
              >
                Start App
              </button>
            </div>

            <p className="text-sm text-gray-700">
              {verifyStatus || startStatus}
            </p>
          </div>
          {/* Right Side Manual */}
          <div className="w-full bg-gray-500/20  border border-white/50 filter bg-blur-sm p-4  backdrop-blur-xl transition-transform  rounded-2xl">
            {/* Frosted backdrop */}
            {/* <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl" /> */}

            <div className="relative z-10 h-96 lg:h-full overflow-y-auto pr-4">
              <h2 className="text-xl font-bold bg-blue-500 bg-clip-text text-transparent">
                Facebook Chatbot Configuration Guide
              </h2>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                {userManual}
              </pre>
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}
