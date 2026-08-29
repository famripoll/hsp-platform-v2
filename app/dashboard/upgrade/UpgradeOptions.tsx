"use client";

import { useState } from "react";

type Plan = "silver" | "gold";
type Frequency = "monthly" | "6months" | "annual";

const silverFeatures = [
  "Full athlete profile",
  "College baseball program search",
  "Contact up to 5 college coaches/month",
  "Photo & video uploads",
  "Standard profile visibility",
];

const goldFeatures = [
  "Everything in Silver",
  "Contact up to 20 college coaches/month",
  "Priority visibility in coach searches",
  "Academic & admissions data — acceptance rates, and more",
  "Recruiting Opportunity Feed",
  "Profile activity insights",
  "Saved programs & watchlist",
];

const prices: Record<Plan, Record<Frequency, number>> = {
  silver: { monthly: 30, "6months": 170, annual: 320 },
  gold: { monthly: 50, "6months": 290, annual: 560 },
};

const periodMonths: Record<Frequency, number> = { monthly: 1, "6months": 6, annual: 12 };
const frequencyLabels: Record<Frequency, string> = {
  monthly: "Monthly",
  "6months": "Every 6 months",
  annual: "Annual",
};
const priceSuffix: Record<Frequency, string> = {
  monthly: "/month",
  "6months": "/6 months",
  annual: "/year",
};

interface UpgradeOptionsProps {
  studentFirstName: string;
  studentId: string;
  parentProfileId: string;
  userEmail: string;
}

export default function UpgradeOptions({
  studentFirstName,
  studentId,
  parentProfileId,
  userEmail,
}: UpgradeOptionsProps) {
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  const savings = (plan: Plan): number | null => {
    if (frequency === "monthly") return null;
    return prices[plan].monthly * periodMonths[frequency] - prices[plan][frequency];
  };

  const handleCheckout = async (plan: Plan) => {
    setCheckoutError("");
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, frequency, studentId, parentProfileId, userEmail }),
      });

      if (!res.ok) {
        setCheckoutError("Something went wrong. Please try again.");
        setLoadingPlan(null);
        return;
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError("Something went wrong. Please try again.");
        setLoadingPlan(null);
      }
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold text-hsp-dark text-center mb-6">
        Activate {studentFirstName}&apos;s profile
      </h2>

      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-hsp-card rounded-xl p-1 gap-1">
          {(Object.keys(frequencyLabels) as Frequency[]).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => setFrequency(freq)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                frequency === freq ? "bg-hsp-red text-white" : "text-hsp-dark hover:bg-white"
              }`}
            >
              {frequencyLabels[freq]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
        {/* Silver Card */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <h3 className="text-2xl font-bold text-hsp-dark mb-1">Silver</h3>
          <div className="mb-1">
            <span className="text-4xl font-bold text-hsp-dark">${prices.silver[frequency]}</span>
            <span className="text-hsp-gray text-sm ml-1">{priceSuffix[frequency]}</span>
          </div>
          <p className="text-hsp-red text-sm mb-8 h-5">
            {savings("silver") !== null ? `Save $${savings("silver")} vs monthly` : ""}
          </p>
          <ul className="flex flex-col gap-3 mb-10 flex-1">
            {silverFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-hsp-dark text-sm">
                <span className="text-hsp-red font-bold mt-0.5 shrink-0">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handleCheckout("silver")}
            className="w-full text-sm font-semibold rounded-xl px-6 py-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-2 border-hsp-red text-hsp-red bg-white hover:bg-hsp-red hover:text-white transition-colors duration-200"
          >
            {loadingPlan === "silver" ? "Redirecting..." : "Get Silver"}
          </button>
          <p className="text-sm text-[#64748b] text-center mt-3">
            Cancel anytime — no long-term commitment.
          </p>
        </div>

        {/* Gold Card */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col border-2 border-hsp-red relative transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-hsp-red text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
            Most popular
          </span>
          <h3 className="text-2xl font-bold text-hsp-dark mb-1">Gold</h3>
          <div className="mb-1">
            <span className="text-4xl font-bold text-hsp-dark">${prices.gold[frequency]}</span>
            <span className="text-hsp-gray text-sm ml-1">{priceSuffix[frequency]}</span>
          </div>
          <p className="text-hsp-red text-sm mb-8 h-5">
            {savings("gold") !== null ? `Save $${savings("gold")} vs monthly` : ""}
          </p>
          <ul className="flex flex-col gap-3 mb-10 flex-1">
            {goldFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-hsp-dark text-sm">
                <span className="text-hsp-red font-bold mt-0.5 shrink-0">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={loadingPlan !== null}
            onClick={() => handleCheckout("gold")}
            className="w-full text-sm font-semibold rounded-xl px-6 py-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-2 border-hsp-red bg-hsp-red text-white hover:bg-white hover:text-hsp-red transition-colors duration-200"
          >
            {loadingPlan === "gold" ? "Redirecting..." : "Get Gold"}
          </button>
          <p className="text-sm text-[#64748b] text-center mt-3">
            Cancel anytime — no long-term commitment.
          </p>
        </div>
      </div>

      {checkoutError && (
        <p className="text-xs text-hsp-red text-center mt-4">{checkoutError}</p>
      )}
    </>
  );
}
