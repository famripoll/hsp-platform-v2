import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | High School Prospect",
  description:
    "Read the High School Prospect Terms and Conditions governing use of the platform and its services.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg md:text-xl font-bold text-hsp-dark">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm md:text-base font-semibold text-hsp-dark">{title}</h3>
      {children}
    </div>
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

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-hsp-card border-l-4 border-hsp-red rounded-r-xl px-5 py-4">
      <p className="text-hsp-dark text-sm md:text-base font-semibold leading-relaxed">{children}</p>
    </div>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-[800px] mx-auto pb-16">

      {/* Page header */}
      <div className="mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-hsp-dark mb-3">
          Terms and <span className="text-hsp-red">Conditions</span>
        </h1>
        <p className="text-hsp-gray text-sm">Last Updated: May 10, 2026</p>
      </div>

      <div className="flex flex-col gap-10 md:gap-12">

        {/* 1 */}
        <Section title="1. Introduction, Scope, and Acceptance">
          <Body>
            Welcome to High School Prospect, a registered DBA of Ripoll Services, LLC (hereinafter referred to as the
            &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using
            our website, services, or any associated features (collectively &ldquo;Platform&rdquo;), you agree to these
            Terms and Conditions (&ldquo;Agreement&rdquo;) and any policies referenced herein. Please read them
            carefully before engaging with the Platform. Use of this Platform after any changes to these Terms indicates
            acceptance of the updated terms.
          </Body>
          <SubSection title="1.1. Definitions">
            <BulletList
              items={[
                '"User": Any individual or entity who registers, accesses, or uses the Platform.',
                '"Athlete Profile": A user-generated digital record for showcasing athletic and academic information.',
                '"Content": Any information, media, data, or materials uploaded or submitted by users.',
                '"Subscription": Payment for access to certain features or areas of the Platform.',
              ]}
            />
          </SubSection>
        </Section>

        {/* 2 */}
        <Section title="2. Purpose">
          <Body>
            Our Platform provides a secure space for high school athletes to create and display online profiles
            containing sports accomplishments, academic information, and related content, intended for review by college
            recruiters and professional scouts.
          </Body>
        </Section>

        {/* 3 */}
        <Section title="3. Eligibility Requirements and COPPA Compliance">
          <Body>
            You must be at least 15 years old to use our services. Our Platform is strictly not directed to, nor
            intended for, children under the age of 13. We do not knowingly collect personal information from children
            under 13. If you are between the ages of 13 and 18, you may only register and use the Platform with
            explicit, verified consent from your parent or legal guardian. By registering, you affirm that you meet
            these eligibility requirements.
          </Body>
        </Section>

        {/* 4 */}
        <Section title="4. Account Registration, Security, and Responsibilities">
          <Body>
            Users are required to furnish accurate, complete registration data and to keep this information updated. You
            are solely responsible for maintaining the confidentiality of all login credentials and for all usage under
            your account. You agree to promptly notify us of any unauthorized account activity.
          </Body>
          <SubSection title="4.1. Multiple Accounts and Transfers">
            <Body>
              You may only possess one active account unless otherwise approved in writing. Accounts may not be sold,
              transferred, or assigned without the Company&rsquo;s written consent.
            </Body>
          </SubSection>
        </Section>

        {/* 5 */}
        <Section title="5. Subscription Plans, Payment Terms & Termination">
          <SubSection title="5.1. Plans Available">
            <Body>
              We offer the following subscription tiers to accommodate our users&rsquo; recruitment needs:
            </Body>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-hsp-card rounded-xl px-5 py-4 flex flex-col gap-1">
                <p className="text-sm font-bold text-hsp-dark mb-1">Silver Plan</p>
                <p className="text-sm text-hsp-gray">$30 per month</p>
                <p className="text-sm text-hsp-gray">$170 for six months</p>
                <p className="text-sm text-hsp-gray">$320 per year</p>
              </div>
              <div className="flex-1 bg-hsp-card border border-hsp-red rounded-xl px-5 py-4 flex flex-col gap-1">
                <p className="text-sm font-bold text-hsp-dark mb-1">Gold Plan</p>
                <p className="text-sm text-hsp-gray">$50 per month</p>
                <p className="text-sm text-hsp-gray">$290 for six months</p>
                <p className="text-sm text-hsp-gray">$580 per year</p>
              </div>
            </div>
          </SubSection>
          <SubSection title="5.2. Payment">
            <Body>
              All subscription fees are payable via credit card using our secure payment processing partner. All charges
              are final, non-refundable, and inclusive of any sales or applicable taxes unless otherwise stated by law.
            </Body>
          </SubSection>
          <SubSection title="5.3. Renewal, Cancellation, and Refunds">
            <Body>
              Subscriptions do not automatically renew unless expressly stated. You may cancel your paid subscription at
              any time. Service will continue for the remainder of the paid period, after which access and data will be
              terminated/deleted permanently within 30 days.
            </Body>
          </SubSection>
          <SubSection title="5.4. Price Changes and Discontinuation">
            <Body>
              The Company reserves the right to update service pricing and subscription structures upon written or
              posted notice. If you do not accept the new pricing, you may cancel before your next billing period.
            </Body>
          </SubSection>
        </Section>

        {/* 6 */}
        <Section title="6. Content Ownership, License, and Sharing">
          <SubSection title="6.1. User Content">
            <Body>
              You retain full copyright and ownership over all materials (photos, videos, stats, academic data) you
              upload to your profile.
            </Body>
          </SubSection>
          <SubSection title="6.2. Profile Publication">
            <Body>
              By participating in the Platform, you grant us a worldwide, royalty-free license to host, display,
              promote, and share content from your profile (including your name, age, height, weight, and high school
              city) on social media or for marketing purposes, solely to increase your visibility among recruiters. You
              may request removal at any time, subject to reasonable processing delays.
            </Body>
          </SubSection>
          <SubSection title="6.3. Content Standards">
            <Body>
              You agree not to upload, distribute, or provide any content that is false, misleading, unlawful,
              defamatory, discriminatory, or otherwise violates these Terms or any rights of third parties.
            </Body>
          </SubSection>
        </Section>

        {/* 7 */}
        <Section title="7. Acceptable Use, Prohibited Activity, and Enforcement">
          <Body>By using this Platform, you agree NOT to:</Body>
          <BulletList
            items={[
              "Impersonate another individual, misrepresent your identity, or create fake recruiting accounts.",
              "Infringe on copyright, trademark, or other intellectual property rights.",
              "Use or attempt to use another user's account.",
              "Post or transmit any content that is unlawful, harassing, abusive, offensive, explicit, or otherwise objectionable.",
              "Tamper with the site's security, network, or digital infrastructure.",
              "Use our services for commercial activities not expressly permitted by us.",
            ]}
          />
          <Body>
            Violation may result in account suspension or termination, removal of content, or legal action.
          </Body>
        </Section>

        {/* 8 */}
        <Section title='8. Disclaimers, No Guarantees & NCAA Compliance'>
          <Body>
            The Platform and its services are provided &ldquo;as is&rdquo; without warranty of any kind, neither
            expressed nor implied.
          </Body>
          <BulletList
            items={[
              "No Recruiting Guarantee: We make no warranty that you will receive any particular scholarship, recruiting offers, or level of exposure.",
              "Amateur Status: High School Prospect is not responsible for maintaining your amateur status. You are solely responsible for understanding and complying with the rules and regulations of the NCAA, NAIA, NJCAA, your state high school athletic association, and any other governing bodies.",
              "User Interactions: While we strive to maintain a secure platform, we cannot fully verify the true identity or intentions of every user or recruiter. We disclaim all liability for user interactions or agreements made outside the Platform.",
            ]}
          />
        </Section>

        {/* 9 */}
        <Section title="9. Limitation of Liability">
          <Body>
            To the maximum extent allowed by law, High School Prospect, its officers, employees, agents, and affiliates
            shall not be liable for indirect, incidental, consequential, punitive, or special damages, whether based on
            contract, tort, negligence, or other legal theory, even if we have been advised of the possibility of such
            damages. Our aggregate liability for any claim will not exceed the greater of: (a) the total amount paid by
            you in the 12 months preceding the claim, or (b) USD $100.
          </Body>
        </Section>

        {/* 10 */}
        <Section title="10. Indemnification">
          <Body>
            You agree to defend, indemnify, and hold harmless High School Prospect, its affiliates, personnel, and
            agents from any demands, losses, claims, liabilities, costs, or expenses (including attorneys&rsquo; fees)
            arising out of: (a) your use or misuse of the Platform; (b) breach of these Terms; (c) infringement of any
            third-party rights; or (d) your violation of any athletic association rules.
          </Body>
        </Section>

        {/* 11 */}
        <Section title="11. Dispute Resolution, Arbitration, and Class Action Waiver">
          <Callout>
            PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.
          </Callout>
          <Body>
            Any dispute, claim, or controversy arising out of or relating to these Terms or the breach, termination,
            enforcement, interpretation, or validity thereof, including the determination of the scope or applicability
            of this agreement to arbitrate, shall be determined by binding arbitration in Florida, rather than in court.
            You and the Company agree to waive any right to a jury trial.
          </Body>
          <Body>
            <strong className="text-hsp-dark">Class Action Waiver:</strong> You agree that any arbitration or
            proceeding shall be limited to the dispute between us and you individually. To the full extent permitted by
            law, no arbitration or proceeding shall be joined with any other, and there is no right or authority for any
            dispute to be arbitrated or resolved on a class action-basis or to utilize class action procedures.
          </Body>
        </Section>

        {/* 12 */}
        <Section title="12. Data Privacy, Retention, and Security">
          <Body>
            Refer to our Privacy Policy for a detailed explanation of data collection, storage, retention, and
            protection methods. All personal data is processed in accordance with applicable law and deleted within 30
            days following account termination unless otherwise required.
          </Body>
        </Section>

        {/* 13 */}
        <Section title="13. DMCA and Copyright">
          <Body>
            If you believe content on the Platform infringes your copyright, please notify us at{" "}
            <a
              href="mailto:copyright@highschoolprospect.com"
              className="text-hsp-red hover:underline"
            >
              copyright@highschoolprospect.com
            </a>{" "}
            with the subject &ldquo;Copyright Notice,&rdquo; providing all details required under the DMCA.
          </Body>
        </Section>

        {/* 14 */}
        <Section title="14. Links to Third Parties">
          <Body>
            The Platform may link to third-party sites or services. We have no control and disclaim responsibility for
            the content, policies, or practices of any linked third party.
          </Body>
        </Section>

        {/* 15 */}
        <Section title="15. Force Majeure">
          <Body>
            We will not be held responsible for delays or failures to perform due to circumstances beyond our reasonable
            control, including, but not limited to, acts of God, war, natural disasters, pandemics, or interruptions to
            service providers.
          </Body>
        </Section>

        {/* 16 */}
        <Section title="16. Modifications to These Terms">
          <Body>
            We reserve the right to update or modify these Terms at any time at our discretion. Updates will be posted
            to this section; your continued use after changes constitutes acceptance.
          </Body>
        </Section>

        {/* 17 */}
        <Section title="17. Severability and Waivers">
          <Body>
            If any part of these terms is found unenforceable, that section will be removed or replaced, while the
            remainder remains enforceable. Our failure to enforce any provision is not a waiver of that right.
          </Body>
        </Section>

        {/* 18 */}
        <Section title="18. Governing Law and Jurisdiction">
          <Body>
            These Terms are governed by the laws of the State of Florida, USA, excluding its conflict of law rules.
            Subject to the Arbitration section above, any legal suit, action, or proceeding shall be instituted
            exclusively in the federal or state courts located in Florida.
          </Body>
        </Section>

        {/* 19 */}
        <Section title="19. Contact Information">
          <Body>
            For all legal, technical, or general inquiries, please contact us at:
          </Body>
          <div className="bg-hsp-card rounded-xl px-6 py-5 flex flex-col gap-1">
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
        </Section>

      </div>
    </div>
  );
}
