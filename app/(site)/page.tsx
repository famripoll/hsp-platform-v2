import Image from "next/image";
import Link from "next/link";
import { BarChart2, PlaySquare, Share2, GraduationCap, User } from "lucide-react";

const steps = [
  {
    title: "Show Your Talent",
    description: "Centralize your athletic journey in one professional link built for college scouts.",
    image: "/step1.png",
  },
  {
    title: "Target Your Schools",
    description: "Discover programs that match your athletic goals and academic requirements perfectly.",
    image: "/step2.png",
  },
  {
    title: "Get Recruited",
    description: "Let verified coaches reach out to your parents directly to start the conversation.",
    image: "/step3.png",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mb-16 md:mb-24">
        <div className="flex flex-col md:flex-row rounded-xl overflow-hidden">

          {/* Left — content */}
          <div className="flex-1 bg-hsp-card px-8 py-12 md:px-12 md:py-16 flex flex-col justify-center gap-6">
            <div className="inline-flex items-center gap-2 bg-hsp-red text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full w-fit">
              <User className="w-3.5 h-3.5" />
              All-In-One Player Profile
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-hsp-dark leading-tight">
              Elevate Your Baseball Recruiting Journey
            </h1>
            <p className="text-hsp-gray text-base md:text-lg leading-relaxed max-w-md">
              Your future starts here. Join the fastest-growing network of
              student-athletes turning their college sports dreams into reality.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-2 bg-white border border-gray-200 rounded-xl px-4 py-3 w-fit">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-hsp-dark">
                <BarChart2 className="w-4 h-4" style={{ color: "#d93025" }} />
                Stats
              </span>
              <span className="text-hsp-gray text-sm">+</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-hsp-dark">
                <PlaySquare className="w-4 h-4" style={{ color: "#d93025" }} />
                Highlights
              </span>
              <span className="text-hsp-gray text-sm">+</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-hsp-dark">
                <Share2 className="w-4 h-4" style={{ color: "#d93025" }} />
                Socials
              </span>
              <span className="text-hsp-gray text-sm">+</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-hsp-dark">
                <GraduationCap className="w-4 h-4" style={{ color: "#d93025" }} />
                Academics
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="px-8 py-3 bg-hsp-red text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-200 flex items-center justify-center text-center">
                Get Started
              </Link>
              <Link href="/learn-more" className="px-8 py-3 bg-white text-hsp-dark border border-hsp-dark font-semibold rounded-lg hover:bg-hsp-card transition-colors hover:scale-105 transition-transform duration-200 flex items-center justify-center text-center">
                Learn More
              </Link>
            </div>
          </div>

          {/* Right — image placeholder */}
          <div className="relative flex-1 min-h-[300px] md:min-h-[500px] bg-hsp-dark">
            <Image
              src="/player-hero.webp"
              alt="Baseball player in action"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16 md:mb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-8 md:mb-12 text-center">
          How It Works: <span className="text-hsp-red">3 Simple Steps</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-hsp-card rounded-xl p-8 flex flex-col gap-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
            >
              <div className="relative w-full h-[200px]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-black text-hsp-dark">{step.title}</h3>
              <p className="text-hsp-gray leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
