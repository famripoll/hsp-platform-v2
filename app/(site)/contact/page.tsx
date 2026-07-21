import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | High School Prospect",
  description:
    "Reach out to the High School Prospect team with questions, feedback, or support requests.",
};

export default function ContactPage() {
  return (
    <div className="pb-16">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">

        {/* Left — Form */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-8 text-center md:text-left">
            Send us a <span className="text-hsp-red">message.</span>
          </h1>
          <ContactForm />
        </div>

        {/* Right — Image panel (desktop only) */}
        <div className="hidden md:block flex-1 relative rounded-2xl overflow-hidden bg-[url('/player-hero.webp')] bg-cover bg-center">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-hsp-dark/70" />
          {/* Phone mockup */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/phone-mockup.png"
              alt="HSP app on mobile"
              width={260}
              height={520}
              className="relative z-10 drop-shadow-2xl"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
