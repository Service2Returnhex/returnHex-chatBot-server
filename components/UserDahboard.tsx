import { Bot, Brain, MessageSquare, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDahboard() {
  const router = useRouter();

  const menuItems = [
    {
      title: "Configure Bot",
      description: "Set up your Facebook page and webhook configuration",
      icon: Settings,
      path: "/user-dashboard/configure-bot",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      title: "Train Posts",
      description: "Train your chatbot with custom responses and behaviors",
      icon: Brain,
      path: "/user-dashboard/train-post",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Update Page Info",
      description: "Modify existing page information and settings",
      icon: Bot,
      path: "/user-dashboard/update-pageInfo",
      gradient: "from-pink-500 to-red-600",
    },
    {
      title: "Train Prompt",
      description: "Create and customize chatbot training prompts",
      icon: MessageSquare,
      path: "/user-dashboard/train-prompt",
      gradient: "from-red-500 to-orange-600",
    },
  ];
  return (
    <div className=" px-0 py-2 w-full">
      {/* Title Section */}
      {/* <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-fadeIn">
          Hex Bot Service
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fadeIn delay-200">
          Manage your Facebook chatbot configuration, training, and page
          information all in one place.
        </p>
      </div> */}

      {/* Menu Cards */}
      <div className="grid md:grid-cols-2 gap-10  mx-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              className="relative group rounded-xl overflow-hidden shadow-md shadow-gray-800 bg-gradient-to-b card-bg backdrop-blur-md border border-gray-800 hover:scale-[1.02] hover:border-gray-500 transition-all duration-300 cursor-pointer "
              onClick={() => router.push(item.path)}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-purple-500 to-pink-500 transition-opacity duration-500" />
              <div className="p-6 flex flex-col items-center text-center space-y-4 ">
                {/* Icon */}
                <div
                  className={`p-4 rounded-xl bg-gradient-to-r ${item.gradient} shadow-md transform group-hover:rotate-6 transition-transform transition-bounce duration-300`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-200 text-md leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
