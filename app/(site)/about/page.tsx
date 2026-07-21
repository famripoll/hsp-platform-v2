import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | High School Prospect",
  description:
    "Learn about High School Prospect and our mission to connect student-athletes with college coaches and scouts.",
};

const paragraphs = [
  "Every student-athlete has a story worth sharing, but too often, that story is never seen by the people who matter most.",
  "High School Prospect was created to help bridge that gap by providing a professional online platform where student-athletes can build a complete recruiting profile and showcase their academic achievements, athletic performance, photos, videos, and social media presence—all in one place.",
  "Today's college coaches and professional scouts discover talent through many different channels. Some rely on recruiting websites, while others use Instagram, X, YouTube, TikTok, Hudl, GameChanger, or other platforms. High School Prospect helps simplify that process by giving student-athletes a centralized profile that brings together the information coaches need, making it easier to evaluate and connect with prospective athletes.",
  "Our platform is designed to support student-athletes, parents, college coaches, and professional scouts throughout the recruiting journey. Student-athletes can present themselves professionally, parents can help manage their profiles, and verified coaches and scouts can efficiently discover and evaluate talent from across the country.",
  "At High School Prospect, we believe that opportunity should never be limited by geography, visibility, or access. Our mission is to provide every student-athlete with a trusted platform to showcase their potential while helping coaches discover the next generation of talented athletes.",
];

const featureCards = [
  {
    icon: "🏆",
    title: "Showcase Your Talent",
    description:
      "Create one professional profile with your academics, athletics, photos, videos, and social media.",
  },
  {
    icon: "🎯",
    title: "Be Easier to Discover",
    description:
      "Help verified college coaches and professional scouts find your complete recruiting information in one place.",
  },
  {
    icon: "🔒",
    title: "Built with Trust and Privacy",
    description:
      "Designed with student safety, parental involvement, and secure data protection as core priorities.",
  },
];

const commitmentParagraphs = [
  "High School Prospect is an independent technology platform designed to help student-athletes gain visibility during the recruiting process. We are not a recruiting agency, sports agent, or scholarship provider, and we do not guarantee athletic scholarships, roster positions, or college admissions.",
  "Protecting student-athletes is one of our highest priorities. Verified college coaches and professional scouts must complete our verification process before accessing recruiting features, and parental or guardian consent is required for users under the age of 18. We are committed to maintaining strong privacy, security, and data protection practices designed to safeguard our users and their information.",
];

export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto">

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-10 md:mb-14 text-center">
        About <span className="text-hsp-red">Us</span>
      </h1>

      {/* Body paragraphs */}
      <div className="flex flex-col gap-6 mb-12 md:mb-16">
        {paragraphs.map((text, index) => (
          <p key={index} className="text-hsp-gray text-base md:text-lg leading-relaxed">
            {text}
          </p>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 md:mb-16">
        {featureCards.map((card) => (
          <div
            key={card.title}
            className="bg-hsp-card rounded-xl p-8 flex flex-col gap-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-4xl mb-2">{card.icon}</div>
            <h3 className="text-xl font-black text-hsp-dark">{card.title}</h3>
            <p className="text-hsp-gray leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Legal compliance box */}
      <div className="bg-hsp-card rounded-xl px-8 py-8 md:px-12 md:py-10">
        <h2 className="text-xs font-bold text-slate-400 mb-4">
          Our Commitment to Student-Athletes
        </h2>
        <div className="flex flex-col gap-6">
          {commitmentParagraphs.map((text, index) => (
            <p key={index} className="text-hsp-gray text-sm leading-relaxed">
              {text}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
}
