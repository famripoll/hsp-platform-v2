import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Show Your Talent",
    description:
      "Build your recruiting profile with stats, highlights, and academic achievements that make coaches take notice.",
  },
  {
    number: "02",
    title: "Target Your Schools",
    description:
      "Browse and connect with college programs that match your athletic ability, academic goals, and personal preferences.",
  },
  {
    number: "03",
    title: "Get Recruited",
    description:
      "Receive interest from coaches, manage communications, and take control of your college recruiting journey.",
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
            <h1 className="text-3xl md:text-5xl font-bold text-hsp-dark leading-tight">
              Elevate Your Athletic Recruiting Journey
            </h1>
            <p className="text-hsp-gray text-base md:text-lg leading-relaxed max-w-md">
              Your future starts here. Join the fastest-growing network of
              student-athletes turning their college sports dreams into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-hsp-red text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                Get Started
              </button>
              <button className="px-8 py-3 bg-white text-hsp-dark border border-hsp-dark font-semibold rounded-lg hover:bg-hsp-card transition-colors">
                Learn More
              </button>
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
        <h2 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-8 md:mb-12">
          How it Works: 3 Simple Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-hsp-card rounded-xl p-8 flex flex-col gap-4"
            >
              <span className="text-4xl font-bold text-hsp-red">
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-hsp-dark">{step.title}</h3>
              <p className="text-hsp-gray leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
