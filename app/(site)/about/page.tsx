import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | High School Prospect",
  description:
    "Learn about High School Prospect and our mission to connect student-athletes with college coaches and scouts.",
};

const paragraphs = [
  "High School Prospect is a digital platform created to help high school baseball players gain visibility and opportunities beyond their hometown fields. Our mission is to connect young athletes with college coaches and scouts by providing a professional space where their talent, effort, and story can be seen and appreciated.",
  "We believe that every player deserves the chance to showcase their potential, no matter where they come from. Through personalized profiles, videos, photos, and academic information, players can present themselves in ways that reflect both their athletic skills and personal dedication.",
  "High School Prospect was designed to simplify the recruiting process, bridging the gap between athletes, parents, and coaches. By building a player profile, students can upload highlight reels, update their stats, share achievements, and communicate with programs that align with their academic and athletic goals.",
  "For college coaches and scouts, the platform serves as a trusted resource for discovering new talent, evaluating player progress, and connecting directly with the next generation of student-athletes.",
  "Our vision is to inspire discipline, integrity, and excellence both on and off the field. High School Prospect is not just a platform; it's a community built to help young athletes turn their dreams of playing college baseball into reality.",
];

export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto text-center">

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-10 md:mb-14">
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

      {/* Legal compliance box */}
      <div className="bg-hsp-card rounded-xl px-8 py-8 md:px-12 md:py-10 text-center">
        <h2 className="text-xs font-bold text-slate-400 mb-4 text-center">
          Legal Compliance
        </h2>
        <p className="text-hsp-gray text-sm leading-relaxed text-center">
          High School Prospect is not a recruiting agency and does not guarantee
          scholarships. We maintain strict adherence to federal COPPA regulations
          for users under 13, as well as comprehensive state privacy laws designed
          to protect the digital data of minors up to 18 years of age. To ensure
          the highest level of security and compliance, parental or guardian
          consent is strictly mandatory for all student-athletes registering on
          our platform.
        </p>
      </div>

    </div>
  );
}
