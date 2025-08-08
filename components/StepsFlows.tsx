"use client";
import {
  FaChalkboardTeacher,
  FaChartLine,
  FaCogs,
  FaLink,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaLink className="text-indigo-500 w-10 h-10" />,
    title: "Connect Page & Tokens",
    description:
      "Easily link your Facebook Page by providing the Page ID, Verify Token, and Access Token.",
  },
  {
    icon: <FaCogs className="text-green-500 w-10 h-10" />,
    title: "Configure Webhook & Verify Token",
    description:
      "Set up your webhook endpoint and verify the token for secure communication.",
  },
  {
    icon: <FaChalkboardTeacher className="text-yellow-500 w-10 h-10" />,
    title: "Train Prompts & Responses",
    description:
      "Teach your bot how to respond to customers by adding training prompts.",
  },
  {
    icon: <FaChartLine className="text-pink-500 w-10 h-10" />,
    title: "Monitor Token Usage & Improve",
    description:
      "Track token spending and continuously improve your bot’s performance.",
  },
];

export default function StepsFlow() {
  return (
    <section className="py-16 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400  to-pink-600 bg-clip-text text-transparent mb-4 animate-fadeIn">
          How It Works
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Set up your Facebook chatbot in just a few easy steps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2  2xl:grid-cols-4 gap-6  w-[80%] justify-center items-center mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg shadow-black hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                {step.title}
              </h3>
              <p className="text-gray-400 text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
