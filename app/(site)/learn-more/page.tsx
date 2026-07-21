import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
        <h1 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-4 leading-tight">
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

      {/* Recruiting Pipeline */}
      <div className="mt-20">

        {/* Section title with decorative lines */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-[2px]" style={{ background: "#d93025" }} />
          <h2 className="text-2xl md:text-3xl font-bold text-hsp-dark whitespace-nowrap">
            RECRUITING PIPELINE
          </h2>
          <div className="flex-1 h-[2px]" style={{ background: "#d93025" }} />
        </div>

        {/* Cards row */}
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-0 relative">

          {/* Gradient connector line — desktop, sits behind cards */}
          <div
            className="hidden md:block absolute left-0 right-0 h-[3px] top-[40%] z-0 pointer-events-none"
            style={{ background: "linear-gradient(to right, #0f172a, #d93025)" }}
          />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center w-full md:flex-1 self-stretch">
            <div
              className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ background: "#F2F3F3" }}
            >
              <div>
                <Image src="/lm-step1.png" alt="The Data CV" width={80} height={80} className="object-contain bg-transparent" style={{ background: "transparent" }} />
              </div>
              <h3 className="font-bold text-hsp-dark text-base">THE DATA CV</h3>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Your stats, academics, video, and profile. Verified. Organized. Recruit-ready.
              </p>
            </div>
          </div>

          {/* Arrow desktop → / mobile ↓ */}
          <div className="relative z-10 flex items-center justify-center md:px-2 py-3 md:py-0">
            <span className="hidden md:block text-2xl font-bold" style={{ color: "#d93025" }}>→</span>
            <span className="md:hidden text-2xl font-bold" style={{ color: "#d93025" }}>↓</span>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center w-full md:flex-1 self-stretch">
            <div
              className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ background: "#F2F3F3" }}
            >
              <div>
                <Image src="/lm-step2.png" alt="Target Radar" width={80} height={80} className="object-contain bg-transparent" style={{ background: "transparent" }} />
              </div>
              <h3 className="font-bold text-hsp-dark text-base">TARGET RADAR</h3>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Discover programs that match your level, goals, location, and academic path.
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="relative z-10 flex items-center justify-center md:px-2 py-3 md:py-0">
            <span className="hidden md:block text-2xl font-bold" style={{ color: "#d93025" }}>→</span>
            <span className="md:hidden text-2xl font-bold" style={{ color: "#d93025" }}>↓</span>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center w-full md:flex-1 self-stretch">
            <div
              className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ background: "#F2F3F3" }}
            >
              <div>
                <Image src="/lm-step3.png" alt="Controlled Strike" width={80} height={80} className="object-contain bg-transparent" style={{ background: "transparent" }} />
              </div>
              <h3 className="font-bold text-hsp-dark text-base">CONTROLLED STRIKE</h3>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Reach coaches with targeted messages, not random posts or lost videos.
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="relative z-10 flex items-center justify-center md:px-2 py-3 md:py-0">
            <span className="hidden md:block text-2xl font-bold" style={{ color: "#d93025" }}>→</span>
            <span className="md:hidden text-2xl font-bold" style={{ color: "#d93025" }}>↓</span>
          </div>

          {/* Step 4 — dark card */}
          <div className="relative z-10 flex flex-col items-center w-full md:flex-1 self-stretch">
            <div
              className="w-full h-full rounded-2xl p-6 flex flex-col items-center text-center gap-3 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{ background: "#0f172a", borderColor: "#d93025" }}
            >
              <div>
                <Image src="/lm-step4.png" alt="The Verified Dugout" width={80} height={80} className="object-contain bg-transparent" style={{ background: "transparent" }} />
              </div>
              <h3 className="font-bold text-white text-base">VERIFIED DUGOUT</h3>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Where verified coaches and serious players connect with confidence.
              </p>
            </div>
          </div>

        </div>

        {/* CTA button */}
        <div className="flex justify-center mt-10">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg font-bold text-white text-sm uppercase tracking-wider hover:scale-105 transition-transform duration-200"
            style={{ background: "#d93025" }}
          >
            START YOUR JOURNEY NOW
          </Link>
        </div>

      </div>
    </div>
  );
}
