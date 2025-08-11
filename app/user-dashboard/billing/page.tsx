"use client";

import { Check, CreditCard, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import axios from '@/lib/axiosInstance' // uncomment when using real API

type Plan = {
  id: string;
  name: string;
  priceMonthly: number | null;
  tokensPerMonth?: number | null;
  features: string[];
  cta?: string;
};

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "failed" | "pending";
  description?: string;
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<Plan | null>(null);
  const [processing, setProcessing] = useState(false);

  // MOCK DATA — replace these with real API requests
  useEffect(() => {
    const mockPlans: Plan[] = [
      {
        id: "free",
        name: "Free",
        priceMonthly: 0,
        tokensPerMonth: 500,
        features: ["1 page", "Basic support"],
        cta: "Start free",
      },
      {
        id: "pro",
        name: "Pro",
        priceMonthly: 29,
        tokensPerMonth: 50000,
        features: [
          "Up to 5 pages",
          "Priority email support",
          "Advanced analytics",
        ],
        cta: "Choose Pro",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        priceMonthly: null,
        tokensPerMonth: null,
        features: ["Unlimited pages", "SLA & account manager"],
        cta: "Contact Sales",
      },
    ];

    const mockInvoices: Invoice[] = [
      {
        id: "inv_001",
        date: "2025-07-01",
        amount: 29,
        status: "paid",
        description: "Pro plan (monthly)",
      },
      {
        id: "inv_002",
        date: "2025-06-01",
        amount: 29,
        status: "paid",
        description: "Pro plan (monthly)",
      },
      {
        id: "inv_003",
        date: "2025-05-01",
        amount: 0,
        status: "paid",
        description: "Free plan",
      },
    ];

    setPlans(mockPlans);
    setCurrentPlan(mockPlans[1]); // currently on Pro (mock)
    setInvoices(mockInvoices);
  }, []);

  // Derived values
  const currentPlanId = currentPlan?.id ?? "free";

  // Replace this with real upgrade API call
  const handleConfirmUpgrade = async (plan: Plan) => {
    if (plan.id === currentPlanId) {
      toast.info(`You're already on the ${plan.name} plan.`);
      setUpgradePlan(null);
      return;
    }

    try {
      setProcessing(true);
      // Example API call:
      // const res = await axios.post('/api/v1/subscriptions/upgrade', { planId: plan.id });
      await new Promise((r) => setTimeout(r, 900)); // fake delay

      // on success update current plan (in real app use response)
      setCurrentPlan(plan);
      toast.success(`Plan changed to ${plan.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Upgrade failed. Try again.");
    } finally {
      setProcessing(false);
      setUpgradePlan(null);
    }
  };

  const handleCancelPaymentMethod = (id: string) => {
    // Demo only
    toast.info("Removed payment method (mock)");
  };

  const handleDownloadInvoice = (inv: Invoice) => {
    toast.info(`Downloading invoice ${inv.id} (mock).`);
    // In real app hit /api/v1/billing/invoices/:id/download and redirect to url
  };

  return (
    <div className="p-6">
      {/* Top header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="text-sm text-gray-300">
            Manage subscription, payment methods and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-300">Current plan</div>
            <div className="font-semibold">{currentPlan?.name ?? "Free"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Current plan & payment method */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-sm text-gray-300">Current Subscription</h3>
            <div className="mt-4">
              <div className="text-lg font-semibold">{currentPlan?.name}</div>
              <div className="text-xs text-gray-400">
                {currentPlan?.priceMonthly === null
                  ? "Custom pricing"
                  : `$${currentPlan?.priceMonthly}/mo`}
              </div>

              <ul className="mt-4 text-sm space-y-2">
                {(currentPlan?.features ?? []).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-200">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => toast.info("Open billing portal (mock)")}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md cursor-pointer"
                >
                  Open billing portal
                </button>
                <button
                  onClick={() => setUpgradePlan(null)}
                  className="px-3 py-1 bg-white/5 rounded-md hover:bg-white/10 cursor-pointer"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl">
            <h3 className="text-sm text-gray-300">Payment Methods</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between bg-white/3 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-gray-200" />
                  <div>
                    <div className="text-sm font-medium">Visa ending 4242</div>
                    <div className="text-xs text-gray-400">Expires 09/2026</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.info("Make default (mock)")}
                    className="text-xs px-2 py-1 rounded-md bg-white/5 cursor-pointer"
                  >
                    Make default
                  </button>
                  <button
                    onClick={() => handleCancelPaymentMethod("pm_1")}
                    className="text-xs px-2 py-1 rounded-md hover:bg-red-600/20 text-red-300 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => toast.info("Add payment (mock)")}
                className="w-full text-sm px-3 py-2 rounded-md border border-white/5 hover:bg-white/5 cursor-pointer"
              >
                + Add payment method
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Plans & invoices */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-3">Plans</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const active = p.id === currentPlanId;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border ${
                      active
                        ? "border-indigo-600 bg-indigo-600/10"
                        : "border-white/6 bg-white/3"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold">{p.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {p.priceMonthly === null
                            ? "Contact sales"
                            : `$${p.priceMonthly}/mo`}
                        </div>
                      </div>

                      {active && (
                        <div className="text-sm text-indigo-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Active
                        </div>
                      )}
                    </div>

                    <ul className="mt-3 text-sm space-y-1 text-gray-200">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="text-xs">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4">
                      <button
                        onClick={() => setUpgradePlan(p)}
                        className={`w-full py-2 rounded-md ${
                          active
                            ? "bg-white/5 text-red cursor-pointer"
                            : "bg-indigo-600 text-white cursor-pointer"
                        }`}
                        disabled={active}
                      >
                        {active ? "Current plan" : p.cta ?? "Choose"}
                      </button>

                      {/* for enterprise, show contact */}
                      {p.id === "enterprise" && (
                        <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          <span>Contact sales for custom pricing</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Billing history</h2>
              <div className="text-sm text-gray-400">Last 12 months</div>
            </div>

            <div className="bg-white/3 backdrop-blur-md p-4 rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-t border-white/5">
                        <td className="py-3">{inv.date}</td>
                        <td className="py-3">{inv.description}</td>
                        <td className="py-3">${inv.amount.toFixed(2)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              inv.status === "paid"
                                ? "bg-green-600/20 text-green-200"
                                : inv.status === "failed"
                                ? "bg-red-600/20 text-red-200"
                                : "bg-yellow-600/20 text-yellow-200"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownloadInvoice(inv)}
                              className="text-xs px-2 py-1 bg-white/5 rounded-md cursor-pointer"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => toast.info("View invoice (mock)")}
                              className="text-xs px-2 py-1 bg-white/5 rounded-md cursor-pointer"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Upgrade confirmation modal */}
      {upgradePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setUpgradePlan(null)}
          />
          <div className="relative bg-gradient-to-tr from-white/5 to-white/2 backdrop-blur-md p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-lg font-semibold">Confirm plan change</h3>
            <p className="text-sm text-gray-300 mt-2">
              Change your plan to{" "}
              <span className="font-medium">{upgradePlan.name}</span>. You will
              be charged{" "}
              {upgradePlan.priceMonthly === null
                ? "custom pricing"
                : `$${upgradePlan.priceMonthly}/mo`}{" "}
              where applicable.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => handleConfirmUpgrade(upgradePlan)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer"
                disabled={processing}
              >
                {processing ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => setUpgradePlan(null)}
                className="px-4 py-2 bg-white/5 rounded-md cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
