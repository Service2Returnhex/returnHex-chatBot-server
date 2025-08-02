"use client";

import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="flex flex-col items-center">
        <Bot size={40} />
        <h1 className="lg:text-4xl">Hex ChatBot Service</h1>
      </div>
      <button
        onClick={() => router.push("/setup")}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
      >
        Configure Bot
      </button>

      <button
        onClick={() => router.push("/train-bot")}
        className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
      >
        Train Bot
      </button>
      <button
        onClick={() => router.push("/update-pageInfo")}
        className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-green-700 transition cursor-pointer"
      >
        Update Page Info
      </button>
    </div>
  );
}
