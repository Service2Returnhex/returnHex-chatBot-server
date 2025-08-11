import { Activity, Book, Brain, ShieldCheck, Zap } from "lucide-react";
import React from "react";

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const DEFAULT_FEATURES: Feature[] = [
  {
    id: "easy-setup",
    title: "Easy Setup",
    description:
      "Connect your Facebook page and tokens in minutes — no developer required.",
    icon: (
      <Zap className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600" />
    ),
  },
  {
    id: "posts-training",
    title: "Posts Training",
    description: "Train your chatbot with custom responses and behaviors.",
    icon: <Brain className="w-6 h-6" />,
  },
  {
    id: "prompt-training",
    title: "Prompt Training",
    description:
      "Train and improve bot responses with simple prompts and versioning.",
    icon: <Book className="w-6 h-6" />,
  },
  {
    id: "real-time-analytics",
    title: "Real-time Analytics",
    description:
      "Monitor token usage and conversation trends with live charts.",
    icon: <Activity className="w-6 h-6" />,
  },
  {
    id: "secure-tokens",
    title: "Secure Tokens",
    description:
      "Store and rotate access tokens safely with role-based access control.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
];

export const FeatureCardGrid: React.FC<{ features?: Feature[] }> = ({
  features = DEFAULT_FEATURES,
}) => {
  return (
    <section className="py-12 ">
      <div className="container mx-auto px-10 ">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400  to-pink-600 bg-clip-text text-transparent mb-4 animate-fadeIn">
            Key Features
          </h2>
          <p className="mt-2 text-gray-300">Top benefits at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {features.map((feature, key) => (
            <article
              key={key}
              className={`relative group bg-white/3 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-4 transition-transform transform hover:-translate-y-2 hover:shadow-xl shadow-md`}
            >
              <div className="absolute rounded-2xl inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-purple-500 to-pink-500 transition-opacity duration-500" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg  bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <h3 className="text-white text-lg font-semibold">
                  {feature.title}
                </h3>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* subtle right-side accent */}
              <span className="absolute -right-6 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl pointer-events-none" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCardGrid;
