import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | High School Prospect",
  description:
    "Choose a plan that fits your recruiting journey. Silver and Gold options for every high school athlete.",
};

const silverFeatures = [
  "Full athlete profile",
  "NCAA program search",
  "1 message/month to coaches",
  "Photo & video uploads",
];

const goldFeatures = [
  "Everything in Silver",
  "Priority profile visibility",
  "Advanced program filters",
  "Monthly opportunity updates",
];

export default function PricingPage() {
  return (
    <div className="max-w-[900px] mx-auto pb-16">

      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-hsp-dark mb-3">
          Choose your <span className="text-hsp-red">plan</span>
        </h1>
        <p className="text-hsp-gray text-base md:text-lg">
          Flexible options for every athlete
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">

        {/* Silver Card */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-hsp-dark mb-1">Silver</h2>
          <div className="mb-4">
            <span className="text-4xl font-bold text-hsp-dark">$30</span>
            <span className="text-hsp-gray text-sm ml-1">/month</span>
          </div>
          <p className="text-hsp-gray text-sm mb-8">
            $170 for 6 months · $320/year
          </p>
          <ul className="flex flex-col gap-3 mb-10 flex-1">
            {silverFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-hsp-dark text-sm">
                <span className="text-hsp-red font-bold mt-0.5 shrink-0">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-hsp-red text-hsp-red bg-white hover:bg-hsp-red hover:text-white transition-colors duration-200 cursor-pointer">
            Get Silver
          </button>
        </div>

        {/* Gold Card */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col border-2 border-hsp-red relative">
          {/* Most popular badge */}
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-hsp-red text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
            Most popular
          </span>
          <h2 className="text-2xl font-bold text-hsp-dark mb-1">Gold</h2>
          <div className="mb-4">
            <span className="text-4xl font-bold text-hsp-dark">$50</span>
            <span className="text-hsp-gray text-sm ml-1">/month</span>
          </div>
          <p className="text-hsp-gray text-sm mb-8">
            $290 for 6 months · $580/year
          </p>
          <ul className="flex flex-col gap-3 mb-10 flex-1">
            {goldFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-hsp-dark text-sm">
                <span className="text-hsp-red font-bold mt-0.5 shrink-0">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl font-semibold text-sm bg-hsp-red text-white hover:opacity-90 transition-opacity duration-200 cursor-pointer">
            Get Gold
          </button>
        </div>

      </div>
    </div>
  );
}
