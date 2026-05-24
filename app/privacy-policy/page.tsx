import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | High School Prospect",
  description:
    "Read the High School Prospect Privacy Policy to understand how we collect, use, and protect your personal information.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg md:text-xl font-bold text-hsp-dark">{title}</h2>
      {children}
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-hsp-gray text-sm md:text-base leading-relaxed">{children}</p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-hsp-gray text-sm md:text-base leading-relaxed">
          <span className="text-hsp-red font-bold mt-0.5 shrink-0">·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[800px] mx-auto pb-16">

      {/* Page header */}
      <div className="mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-hsp-dark mb-3">
          Privacy <span className="text-hsp-red">Policy</span>
        </h1>
        <p className="text-hsp-gray text-sm">Effective Date: May 10, 2026</p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-10 md:gap-12">

        <Section title="1. Introduction">
          <Body>
            At High School Prospect (a platform owned and operated by Ripoll Services, LLC), we believe in empowering
            student-athletes while fiercely protecting their personal data. This Privacy Policy outlines how we collect,
            use, safeguard, and disclose your information when you access our website, mobile applications, and
            recruiting services (collectively, the &ldquo;Services&rdquo;). By utilizing our Services, you consent to
            the practices described in this policy.
          </Body>
        </Section>

        <Section title="2. Information We Collect">
          <Body>
            To build a comprehensive recruiting profile and operate our platform effectively, we collect the following
            data:
          </Body>
          <BulletList
            items={[
              "Account & Identity Data: Full name, contact details, date of birth, and parent/guardian information.",
              "Athletic & Academic Metrics: Sport, team affiliations, graduation year, GPA, test scores (SAT/ACT), transcripts, and physical attributes (height/weight).",
              "Digital Footprint: IP addresses, browser types, device identifiers, and geographic location (if enabled).",
              "Media & Communications: Profile pictures, highlight videos, personal statements, and chat transcripts from our messaging features or customer service bots.",
              "Payment Information: Credit card details and billing addresses for premium subscriptions (processed securely by third-party gateways).",
            ]}
          />
        </Section>

        <Section title="3. How We Use Your Data">
          <Body>We do not collect your data to sell it. We use it strictly to:</Body>
          <BulletList
            items={[
              "Maximize your exposure to college recruiters and scouts.",
              "Process secure payments and manage your subscription tiers.",
              "Improve platform functionality through analytics tools like Google Analytics.",
              "Protect our community by preventing fraud, verifying age, and monitoring unauthorized access.",
            ]}
          />
        </Section>

        <Section title="4. Public Profiles & Data Sharing">
          <Body>
            The core purpose of High School Prospect is visibility. Therefore, certain profile elements such as your
            name, graduation class, athletic stats, and highlight videos are public by default. This information can be
            viewed by other users and indexed by external search engines.
          </Body>
          <Body>We only share your private backend data with:</Body>
          <BulletList
            items={[
              "Service Providers: Trusted partners who host our servers, process payments, or provide technical support.",
              "Legal Authorities: When mandated by court orders, subpoenas, or to protect the safety of our users.",
              "Corporate Transfers: In the event of a merger or acquisition of Ripoll Services, LLC or High School Prospect.",
            ]}
          />
        </Section>

        <Section title="5. Cookies and Tracking Technologies">
          <Body>
            Our platform utilizes cookies, web beacons, and similar tracking tools to enhance your user experience and
            deliver relevant content. You can manage your cookie preferences through your browser settings or opt-out of
            targeted advertising. We proudly respect Global Privacy Control (GPC) signals for users who wish to restrict
            cross-contextual tracking.
          </Body>
        </Section>

        <Section title="6. Minors and COPPA Compliance">
          <Body>
            Protecting young athletes is our top priority. Our Services are strictly intended for users who are 13 years
            of age or older. We do not knowingly collect personal data from children under 13. If you are a minor under
            18, verifiable parental consent is integrated into our registration process. If we discover data from a child
            under 13 has been collected inadvertently, it will be deleted immediately.
          </Body>
        </Section>

        <Section title="7. Data Security and International Transfers">
          <Body>
            We implement robust physical and electronic safeguards to protect your information. However, no digital
            transmission is entirely secure, and you use the Services at your own risk. All data is processed and stored
            within the United States. If you are accessing the platform internationally, you consent to the transfer of
            your data to the U.S., which may have different privacy laws than your jurisdiction.
          </Body>
        </Section>

        <Section title="8. Your Rights (GDPR, CCPA, and Nevada Privacy Laws)">
          <Body>Depending on your location, you possess specific rights regarding your data:</Body>
          <BulletList
            items={[
              "U.S. Residents (California/Nevada): We do not sell your personal information for monetary value. You may request an outline of the data we hold or request deletion.",
              "European (EEA), UK, and Swiss Residents: You have the right to access, rectify, restrict processing, or request the deletion of your personal data. You may also file a complaint with your local supervisory authority (e.g., the ICO in the UK).",
              "Links to Data Protection Authorities: UK Users — [ICO], EU Users — [EU Data Protection Board], Swiss Users — [FDPIC].",
            ]}
          />
        </Section>

        <Section title="9. Managing Your Preferences and Exercising Rights">
          <Body>
            To exercise your privacy rights, update your information, or appeal a previous privacy decision, you must
            submit a verifiable request. Please email our compliance team directly at:
          </Body>
          <div className="bg-hsp-card rounded-xl px-6 py-5">
            <p className="text-sm text-hsp-gray">
              Email:{" "}
              <a
                href="mailto:support@highschoolprospect.com"
                className="text-hsp-red font-semibold hover:underline"
              >
                support@highschoolprospect.com
              </a>
            </p>
          </div>
        </Section>

        <Section title="10. Changes to This Policy">
          <Body>
            As our platform evolves, so will this Privacy Policy. We will post updates on this page, and the
            &ldquo;Effective Date&rdquo; will reflect the most recent changes. Continued use of the platform constitutes
            your agreement to the revised terms.
          </Body>
        </Section>

        {/* Company info */}
        <div className="border-t border-gray-200 pt-8 flex flex-col gap-1">
          <p className="text-sm font-semibold text-hsp-dark">Ripoll Services, LLC</p>
          <p className="text-sm text-hsp-gray">DBA High School Prospect</p>
          <a
            href="mailto:support@highschoolprospect.com"
            className="text-sm text-hsp-red hover:underline"
          >
            support@highschoolprospect.com
          </a>
          <p className="text-sm text-hsp-gray">www.highschoolprospect.com</p>
        </div>

      </div>
    </div>
  );
}
