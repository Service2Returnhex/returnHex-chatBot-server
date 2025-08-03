"use client";

import { Brain, MessageSquare, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const menuItems = [
    {
      title: "Configure Bot",
      description: "Set up your Facebook page and webhook configuration",
      icon: Settings,
      path: "/setup",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Train Bot",
      description: "Train your chatbot with custom responses and behaviors",
      icon: Brain,
      path: "/train-bot",
      gradient: "from-purple-500 to-purple-600",
    },
    // {
    //   title: "Update Page Info",
    //   description: "Modify existing page information and settings",
    //   icon: Bot,
    //   path: "/update-page-info",
    //   gradient: "from-green-500 to-green-600",
    // },
    {
      title: "Train Prompt",
      description: "Create and customize chatbot training prompts",
      icon: MessageSquare,
      path: "/train-prompt",
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-black relative text-white ">
      {/* Midnight Mist */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
        }}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-fadeIn">
            Hex Bot Service
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fadeIn delay-200">
            Manage your Facebook chatbot configuration, training, and page
            information all in one place.
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid md:grid-cols-3 gap-8  mx-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                className="relative group rounded-lg overflow-hidden shadow-lg bg-gray-800 border border-gray-700 hover:scale-[1.02] hover:border-gray-500 transition-all duration-300"
                onClick={() => router.push(item.path)}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-purple-500 to-pink-500 transition-opacity duration-500" />
                <div className="p-6 flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-r ${item.gradient} shadow-md transform group-hover:rotate-6 transition-transform duration-300`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2 group-hover:text-blue-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tailwind Animations */}
      {/* <style jsx global>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style> */}
    </div>
  );
}
