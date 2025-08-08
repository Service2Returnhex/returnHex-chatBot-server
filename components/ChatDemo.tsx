"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const presetResponses: Record<string, string> = {
  hello: "Hi there! 👋 I'm your Facebook bot. How can I help?",
  "how are you": "I'm doing great, thanks for asking! 🤖",
  price: "Our plans start from $0 — check the Pricing section below 💰",
  default: "I'm not sure about that, but I'm learning more every day! 📚",
};

export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi! Type something to see me respond." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // User message
    const userMsg: Message = { sender: "user", text: input.trim() };

    // Bot response (basic match)
    const lower = input.trim().toLowerCase();
    const botReply =
      presetResponses[lower as keyof typeof presetResponses] ||
      presetResponses.default;
    const botMsg: Message = { sender: "bot", text: botReply };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto bg-gray-800 text-white rounded-xl shadow-lg flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-indigo-600 p-3 font-semibold text-center">
        Bot Live Demo
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto h-72">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${
                msg.sender === "user"
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-gray-900 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-500 hover:bg-indigo-600 p-2 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
