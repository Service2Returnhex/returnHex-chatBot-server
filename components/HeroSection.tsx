import Link from "next/link";
import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
};

const CTAButton: React.FC<
  React.PropsWithChildren<{ href: string; variant?: "primary" | "ghost" }>
> = ({ href, children, variant = "primary" }) => {
  return (
    <Link
      href={href}
      className={`inline-flex z-5 items-center gap-3 rounded-2xl px-6 py-3 font-medium transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${
        variant === "primary"
          ? "bg-indigo-600 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 "
          : "bg-white/10 text-white hover:bg-white/20"
      }`}
      aria-label={`${children}`}
    >
      {children}
    </Link>
  );
};

export default function HeroSection({ title, subtitle }: Props) {
  return (
    <section className="relative overflow-hidden pt-6">
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Headline + CTAs */}
          <div className="lg:col-span-6">
            <p className="inline-block rounded-full bg-indigo-100/20 text-indigo-300 px-3 py-1 text-sm mb-4">
              New · 3-day free trial
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold leading-tight text-white">
              {title ?? "Manage your Facebook Chatbot in minutes."}
            </h1>

            <p className="mt-6 max-w-xl text-lg text-gray-200">
              {subtitle ??
                "Connect pages, configure webhooks, train prompts, and monitor token usage from a single dashboard — built for speed and clarity."}
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <CTAButton href="/configure-bot" variant="primary">
                Configure Bot
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </CTAButton>

              <CTAButton href="/train-bot" variant="ghost">
                Try Demo
              </CTAButton>
            </div>

            {/* Trust / Stats */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 px-3 py-2 text-white/90 font-semibold">
                  ★ 4.9
                </div>
                <div className="text-sm text-gray-300">
                  Rated by 1,200+ users
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-sm text-gray-300">
                <svg
                  className="h-5 w-5 text-indigo-300"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 22v-6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>Trusted across shops & support teams</span>
              </div>
            </div>
          </div>

          {/* Right: Mockup / Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div
              aria-hidden
              className="relative w-full max-w-md transform rounded-3xl bg-gradient-to-tr from-white/5 to-white/2 p-6 shadow-2xl backdrop-blur-md"
            >
              {/* Simulated chat UI */}
              <div className="mb-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-500/80 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div>
                  <div className="h-3 w-24 rounded-lg bg-white/10" />
                  <div className="h-2 w-16 rounded-lg bg-white/6 mt-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="ml-auto max-w-xs rounded-2xl bg-indigo-600/95 px-4 py-3 text-sm text-white shadow">
                  Hi there 👋 How can I help you plan your tour today?
                </div>

                <div className="max-w-[85%] rounded-2xl bg-white/8 px-4 py-3 text-sm text-gray-200">
                  I’d like to see all your tour packages.
                </div>

                <div className="ml-auto max-w-xs rounded-2xl bg-indigo-600/95 px-4 py-3 text-sm text-white shadow animate-pulse/50">
                  Great — here are our popular packages. Would you like to
                  filter by destination or price?
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <input
                  aria-label="Type a message"
                  placeholder="Type a quick message..."
                  className="flex-1 rounded-full bg-white/6 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  aria-label="Send"
                  className="rounded-full bg-indigo-500 px-3 py-2 text-white hover:bg-indigo-400"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background shapes */}
      {/* <div
        className=" absolute -left-40 -top-40 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-indigo-500 to-violet-400"
        aria-hidden
      />
      <div
        className=" absolute -right-40 -bottom-44 h-72 w-72 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-cyan-400 to-indigo-600"
        aria-hidden
      /> */}
    </section>
  );
}
