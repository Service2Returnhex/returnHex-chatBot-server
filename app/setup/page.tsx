"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatbotUserSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pageName: "",
    address: "",
    phone: "",
    pageCategory: "",
    pageId: "",
    verifyToken: "",
    accessToken: "",
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
  const handleProvideInfo = async () => {
    try {
      const res = await axios.post("http://localhost:5002/api/v1/page/shop", {
        ...formData,
        shopId: formData.pageId,
      });
      const generatedURL = `${window.location.origin}/api/v1/meta-webhook/${formData.pageId}/webhook`;
      setWebhookURL(generatedURL);
      setVerifyStatus("Webhook URL and Verify Token generated successfully.");
      toast.success("Webhook URL and Verify Token generated successfully.");
      localStorage.setItem("pageId", formData.pageId);
    } catch (err) {
      setVerifyStatus("Failed to send info. Please check and try again.");
      toast.error("Failed to send info. Please check and try again.");
    }
  };

  const handleSendAccessToken = async () => {
    try {
      await axios.patch(
        `http://localhost:5002/api/v1/page/shop/${formData.pageId}`,
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
        `http://localhost:5002/api/v1/page/shop/${formData.pageId}`
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

  return (
    <div className=" container mx-auto flex flex-col md:flex-row p-4 gap-4">
      {/* Left Side Form */}
      <div className="w-full md:w-1/2 space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 py-2 text-lg font-medium
        hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
          <span className="text-blue-500">Back</span>
        </button>
        <h2 className="text-xl font-bold">Configure Your Bot</h2>

        <input
          type="text"
          name="pageName"
          placeholder="Page Name"
        //   value={formData.pageName}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
        //   value={formData.address}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
        //   value={formData.phone}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="pageCategory"
          placeholder="Page Category"
        //   value={formData.pageCategory}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="pageId"
          placeholder="Page ID"
        //   value={formData.pageId}

          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="verifyToken"
          placeholder="Verify Token"
        //   value={formData.verifyToken}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />

        <button
          onClick={handleProvideInfo}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Provide Info
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
        <input
          type="text"
          name="accessToken"
          placeholder="Access Token"
        //   value={formData.accessToken}
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />

        <div className="flex gap-2">
          <button
            onClick={handleSendAccessToken}
            className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Submit Access Token
          </button>

          <button
            onClick={handleStartApp}
            className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            Start App
          </button>
        </div>

        <p className="text-sm text-gray-700">{verifyStatus || startStatus}</p>
      </div>

      {/* Right Side Manual */}
      <div className="w-full md:w-1/2 border p-4 rounded bg-gray-50 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-2">📘 ChatBot User Manual</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            Create a Facebook account:{" "}
            <Link
              href={"https://facebook.com"}
              target="_blank"
              className="text-blue-700"
            >
              https://facebook.com
            </Link>
          </li>
          <li>Create a Facebook Page if you don't already have one.</li>
          <li>
            Go to Meta for Developers:{" "}
            <Link
              href={"https://developers.facebook.com"}
              target="_blank"
              className="text-blue-700"
            >
              https://developers.facebook.com
            </Link>
          </li>
          <li>Create a new App (Business type preferred).</li>
          <li>Add Webhooks and Messenger products from the left menu.</li>
          <li>Navigate to App Settings - Basic. Fill out the form.</li>
          <li>
            Generate a free Privacy Policy:{" "}
            <Link
              href={"https://www.freeprivacypolicy.com"}
              target="_blank"
              className="text-blue-700"
            >
              https://www.freeprivacypolicy.com
            </Link>
          </li>
          <li>Switch App Mode to Live from the top navbar.</li>
          <li>
            Go to Messenger - Messenger API Settings and connect your Page.
          </li>
          <li>Copy the Page ID. Submit it with other info on the left form.</li>
          <li>
            Use the generated Webhook URL and Verify Token for Messenger setup.
          </li>
          <li>
            Subscribe to required webhook fields: messages, message_reads, etc.
          </li>
          <li>
            Use Graph API Explorer to generate an access token with required
            permissions.
          </li>
          <li>Submit the token in the form and start the app.</li>
        </ol>
        <p className="text-lg mt-2  font-bold mb-2">
          📘Detailed documentation:
          <Link
            href={
              "https://docs.google.com/document/d/1_eaQADKzvhlJxL2xGAZRO8lSDjiWsQ16_IREJHmzR-I/edit?usp=sharing"
            }
            target="_blank"
            className="text-blue-700"
          >
            &nbsp; Doc
          </Link>
        </p>
      </div>
    </div>
  );
}
