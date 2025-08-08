"use client";

// import axios from "@/lib/axiosInstance";
import { useState } from "react";
import { toast } from "react-toastify";

interface Plan {
  id: string;
  name: string;
  priceMonthly: string | number;
  tokensPerMonth: string;
  pagesAllowed: string;
  features: string[];
  cta: string;
}

export default function PricingGrid() {
  const [plans, setPlans] = useState<Plan[]>([]);
  //   const [loading, setLoading] = useState(true);
  const plansData = [
    {
      id: "free",
      name: "Free",
      priceMonthly: 0,
      tokensPerMonth: "500",
      pagesAllowed: "1",
      features: [
        "Basic bot setup",
        "Community support",
        "Webhook configuration",
        "Access to training prompts",
      ],
      cta: "Start Free",
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 29,
      tokensPerMonth: "50,000",
      pagesAllowed: "5",
      features: [
        "All Free features",
        "Priority email support",
        "Advanced analytics dashboard",
        "Bulk prompt training",
        "Custom webhook event handling",
      ],
      cta: "Choose Pro",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      priceMonthly: "Custom pricing",
      tokensPerMonth: "Unlimited",
      pagesAllowed: "Unlimited",
      features: [
        "All Pro features",
        "SLA with guaranteed uptime",
        "Dedicated account manager",
        "Onboarding & team training",
        "Custom integrations & API extensions",
      ],
      cta: "Contact Sales",
    },
  ];

  //   useEffect(() => {
  //     const fetchPlans = async () => {
  //       try {
  //         const { data } = await axios.get("/api/v1/plans");
  //         setPlans(data);
  //       } catch (error) {
  //         toast.error("Failed to load pricing plans");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchPlans();
  //   }, []);

  //   if (loading) {
  //     return (
  //       <div className="text-center py-10 text-gray-400">
  //         Loading pricing plans...
  //       </div>
  //     );
  //   }

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400  to-pink-600 bg-clip-text text-transparent mb-4 animate-fadeIn">
            Subscription Plans
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Choose the plan that’s right for your needs.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plansData.map((plan) => (
            <div
              key={plan.id}
              className=" rounded-2xl bg-gray-800 shadow-lg shadow-black hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col"
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {plan.name}
              </h3>

              <p className="mt-4 text-4xl font-bold text-indigo-600">
                {typeof plan.priceMonthly === "number"
                  ? `$${plan.priceMonthly}`
                  : plan.priceMonthly}
                {typeof plan.priceMonthly === "number" && (
                  <span className="text-base font-medium text-gray-500">
                    /mo
                  </span>
                )}
              </p>

              <ul className="mt-6 space-y-3 text-gray-600 dark:text-gray-300 flex-1">
                <li>
                  <strong>{plan.pagesAllowed}</strong> pages allowed
                </li>
                <li>
                  <strong>{plan.tokensPerMonth}</strong> tokens / month
                </li>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>

              <button
                className="mt-8 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => toast.success(`Selected: ${plan.name}`)}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
