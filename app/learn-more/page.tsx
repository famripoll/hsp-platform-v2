import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn More | High School Prospect",
  description:
    "See why a specialized recruiting platform beats social media for connecting high school athletes with college coaches.",
};

const lotteryItems = [
  "Algorithms hide GPA",
  "Videos get lost",
  "Coaches can't filter",
];

const pipelineItems = [
  "Verified scout-ready search",
  "Hyper-filtered analytics",
  "Unified profile with privacy",
];

export default function LearnMorePage() {
  return (
    <div className="max-w-[900px] mx-auto pb-16">

      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-hsp-dark uppercase mb-4 leading-tight">
          Social Media Gets Views.{" "}
          <span className="text-hsp-red">We Get You On The Lineup.</span>
        </h1>
        <p className="text-hsp-gray text-base md:text-lg">
          Stop betting your future on a random timeline. Welcome to the intentional pipeline.
        </p>
      </div>

      {/* Comparison cards */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">

        {/* Card 1 — Traditional Social Media */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <h2 className="text-xl font-bold text-hsp-dark">Traditional Social Media</h2>
          <p className="text-hsp-gray text-sm mb-8">(The Lottery)</p>
          <ul className="flex flex-col gap-4">
            {lotteryItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-hsp-dark text-sm">
                <span className="text-hsp-red font-bold mt-0.5 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2 — Our Specialized Platform */}
        <div className="flex-1 bg-hsp-card rounded-2xl p-8 flex flex-col border-2 border-hsp-red transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <h2 className="text-xl font-bold text-hsp-dark">Our Specialized Platform</h2>
          <p className="text-hsp-gray text-sm mb-8">(The Pipeline)</p>
          <ul className="flex flex-col gap-4">
            {pipelineItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-hsp-dark text-sm">
                <span className="text-green-600 font-bold mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
