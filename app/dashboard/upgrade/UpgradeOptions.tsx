"use client";

import { useState } from "react";

type Plan = "silver" | "gold";
type Frequency = "monthly" | "6months" | "annual";

const silverFeatures = [
  "Full athlete profile",
  "NCAA / NAIA / NJCAA program search",
  "Direct messaging to college coaches",
  "Photo & video uploads",
];

const goldFeatures = [
  "Everything in Silver",
  "Priority profile visibility",
  "Advanced program filters",
  "Monthly opportunity updates",
];

const prices: Record<Plan, Record<Frequency, number>> = {
  silver: { monthly: 30, "6months": 170, annual: 320 },
  gold: { monthly: 50, "6months": 290, annual: 580 },
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

  const savings = (plan: Plan): number | null => {
    if (frequency === "monthly") return null;
    return prices[plan].monthly * periodMonths[frequency] - prices[plan][frequency];
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
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col">
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
            disabled
            className="w-full text-sm font-semibold text-white rounded-xl px-6 py-3 hover:opacity-90 transition-opacity duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#d93025" }}
          >
            Checkout coming soon
          </button>
        </div>

        {/* Gold Card */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col border-2 border-hsp-red relative">
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
            disabled
            className="w-full text-sm font-semibold text-white rounded-xl px-6 py-3 hover:opacity-90 transition-opacity duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#d93025" }}
          >
            Checkout coming soon
          </button>
        </div>
      </div>
    </>
  );
}
