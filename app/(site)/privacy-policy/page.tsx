import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fragment } from "react";
import PrivacyTableOfContents, { type PrivacySectionRef } from "./PrivacyTableOfContents";

export const metadata: Metadata = {
  title: "Privacy Policy | High School Prospect",
  description:
    "Read the High School Prospect Privacy Policy to understand how we collect, use, and protect your personal information.",
};

const EFFECTIVE_DATE = "July 20, 2026";
const SUPPORT_EMAIL = "support@highschoolprospect.com";

type PrivacySection = {
  number: number;
  title: string;
  body: string;
  extra?: ReactNode;
};

const CONTACT_CARD = (
  <div className="bg-hsp-card rounded-xl px-6 py-5 flex flex-col gap-1">
    <p className="text-sm font-semibold text-hsp-dark">Ripoll Services, LLC</p>
    <p className="text-sm text-hsp-gray">401 East Jackson Street</p>
    <p className="text-sm text-hsp-gray">Suite 2340-N83</p>
    <p className="text-sm text-hsp-gray">Tampa, Florida 33602</p>
    <p className="text-sm text-hsp-gray mb-2">United States</p>
    <p className="text-sm text-hsp-gray">
      Email:{" "}
      <a href={`mailto:${SUPPORT_EMAIL}`} className="text-hsp-red hover:underline">
        {SUPPORT_EMAIL}
      </a>
    </p>
    <p className="text-sm text-hsp-gray">
      Website:{" "}
      <a
        href="https://www.highschoolprospect.com"
        className="text-hsp-red hover:underline"
      >
        https://www.highschoolprospect.com
      </a>
    </p>
  </div>
);

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    number: 1,
    title: "Introduction",
    body: `Welcome to High School Prospect ("High School Prospect," "we," "our," or "us"), an online platform operated by Ripoll Services, LLC, a Florida limited liability company doing business as High School Prospect.

This Privacy Policy explains how we collect, use, disclose, store, protect, and otherwise process your personal information when you access or use our website, mobile applications, and related services (collectively, the "Platform").

By accessing or using the Platform, you acknowledge that you have read and understood this Privacy Policy and consent to the practices described herein. If you do not agree with this Privacy Policy, you should not use the Platform.

This Privacy Policy should be read together with our Terms & Conditions.`,
  },
  {
    number: 2,
    title: "Information We Collect",
    body: `We collect information that you voluntarily provide, information generated through your use of the Platform, and certain information provided by authorized third parties.

Depending on your use of the Platform, we may collect:

### A. Account Information

- Full name
- Email address
- Password (encrypted)
- Date of birth
- City and state
- User role (Student-Athlete, Parent/Guardian, College Coach, or Professional Scout)

### B. Student Profile Information

Student-athletes may choose to provide recruiting information, including:

- Graduation year
- Primary and secondary positions
- Height
- Weight
- Bats/Throws information
- Athletic statistics
- Academic information
- Intended college major
- Awards and achievements
- Biography
- Recruiting preferences
- Photos
- Videos
- Social media links

Providing optional profile information is voluntary. However, more complete profiles may improve recruiting visibility.

### C. Parent and Guardian Information

For users under the age of eighteen (18), we may collect:

- Parent or guardian name
- Email address
- Phone number
- Relationship to the student
- Consent records

### D. Coach and Scout Information

Verified coaches and professional scouts may provide:

- Institution or organization
- Job title
- Division or affiliation
- Work email
- Verification information
- Profile photograph

### E. Communications

When you communicate through the Platform, we may collect:

- Messages exchanged between users
- Customer support requests
- Feedback
- Reports of abuse or policy violations

### F. Technical Information

We may automatically collect certain technical information, including:

- IP address
- Browser type
- Device information
- Operating system
- Language preferences
- Time zone
- Pages visited
- Features used
- Referral URLs
- Log information

### G. Subscription Information

If you purchase a subscription, we may receive information related to your subscription status, billing history, transaction confirmations, and subscription plan from authorized third-party payment providers.

High School Prospect does not store complete payment card information.`,
  },
  {
    number: 3,
    title: "How We Use Your Information",
    body: `We use your information to operate, maintain, improve, and protect the Platform.

Examples include:

- Creating and managing user accounts
- Displaying recruiting profiles
- Providing verified college coaches and professional scouts with tools to discover, evaluate, and connect with student-athletes.
- Processing subscriptions
- Providing customer support
- Sending account notifications
- Sending security alerts
- Responding to legal requests
- Detecting fraud and unauthorized activity
- Enforcing our Terms & Conditions
- Improving Platform performance
- Developing new features
- Performing internal analytics
- Protecting the safety of our users
- Complying with applicable laws

We do not sell your personal information for monetary compensation.`,
  },
  {
    number: 4,
    title: "Public Profile Information",
    body: `The purpose of High School Prospect is to increase recruiting visibility for student-athletes.

Accordingly, certain profile information may be publicly visible to visitors, verified coaches, verified professional scouts, and search engines.

Public profile information may include:

- Name
- Profile photograph
- City and state
- Graduation year
- Primary position
- Secondary position
- Height
- Weight
- Athletic statistics that the student chooses to publish
- Photos and videos designated as public by the Platform

The following information is not publicly displayed:

- Parent or guardian information
- Personal email addresses
- Phone numbers
- Home addresses
- Account credentials
- Payment information
- Internal account records
- Private communications
- Administrative notes

We reserve the right to modify which profile fields are public as the Platform evolves.`,
  },
  {
    number: 5,
    title: "Information Shared with Parents and Guardians",
    body: `Parents and legal guardians play an important role in managing accounts belonging to users under eighteen (18) years of age.

Where applicable, parents or guardians may:

- Provide required consent during registration;
- Access and manage the student's account;
- Update profile information;
- Communicate with High School Prospect regarding the student's account;
- Request corrections to personal information; and
- Request deletion of the student's account, subject to applicable legal obligations.

Once a student reaches the age of eighteen (18), account management rights may transition to the student unless otherwise required by law.`,
  },
  {
    number: 6,
    title: "How We Share Information",
    body: `We do not sell personal information for monetary compensation.

We may share information only under the following circumstances:

### A. Service Providers

We may share information with trusted third-party service providers that help us operate the Platform, including providers that assist with:

- cloud infrastructure;
- payment processing;
- customer support;
- communications;
- security;
- analytics; and
- technical operations.

These providers are permitted to use personal information only as necessary to perform services on our behalf.

### B. Legal Requirements

We may disclose information when we reasonably believe disclosure is necessary to:

- comply with applicable laws;
- respond to lawful legal requests;
- protect our legal rights;
- investigate fraud or security incidents; or
- protect the safety of users or the public.

### C. Business Transactions

If High School Prospect or Ripoll Services, LLC is involved in a merger, acquisition, sale of assets, financing, or other corporate transaction, user information may be transferred as part of that transaction, subject to applicable law.`,
  },
  {
    number: 7,
    title: "Cookies and Similar Technologies",
    body: `High School Prospect uses cookies and similar technologies to improve the functionality, security, and performance of the Platform.

These technologies may be used to:

- keep users signed in;
- remember user preferences;
- improve website performance;
- analyze Platform usage;
- maintain security;
- detect fraudulent activity; and
- enhance the overall user experience.

Most web browsers allow users to control or disable cookies through their browser settings. However, disabling certain cookies may affect the functionality of the Platform.

Where required by applicable law, users will be provided with options to manage their cookie preferences.`,
  },
  {
    number: 8,
    title: "Analytics",
    body: `We use analytics tools to better understand how users interact with the Platform.

Analytics information may include:

- pages visited;
- session duration;
- navigation patterns;
- device type;
- browser information;
- operating system;
- referral sources; and
- general geographic region.

Analytics data helps us:

- improve user experience;
- identify technical issues;
- develop new features;
- monitor Platform performance; and
- better understand user engagement.

Analytics information is used in an aggregated or de-identified manner whenever reasonably possible.`,
  },
  {
    number: 9,
    title: "Communications",
    body: `High School Prospect may send communications related to your account and use of the Platform.

These communications may include:

- account verification;
- password reset requests;
- security alerts;
- subscription notifications;
- important policy updates;
- technical notices;
- customer support responses; and
- administrative announcements.

Users may also choose to receive optional communications such as:

- recruiting opportunities;
- educational content;
- newsletters;
- product updates; and
- promotional announcements.

Users may opt out of optional marketing communications at any time. However, users cannot opt out of communications that are necessary for the operation, security, or administration of their accounts.`,
  },
  {
    number: 10,
    title: "Subscription and Payment Information",
    body: `Certain features of the Platform may require a paid subscription.

Payments are securely processed by authorized third-party payment providers.

High School Prospect does not store complete payment card numbers, security codes (CVV), or other full payment credentials.

We may receive limited information related to transactions, including:

- subscription status;
- billing confirmations;
- renewal dates;
- transaction identifiers; and
- payment status.

This information is used solely for:

- managing subscriptions;
- providing customer support;
- processing refunds where applicable;
- preventing fraud; and
- maintaining accurate business records.`,
  },
  {
    number: 11,
    title: "Data Retention",
    body: `We retain personal information only for as long as reasonably necessary to:

- provide the Platform;
- maintain user accounts;
- comply with legal obligations;
- resolve disputes;
- enforce our agreements; and
- protect our legal rights.

The length of time information is retained depends on factors such as:

- the nature of the information;
- applicable legal requirements;
- ongoing business needs; and
- legitimate security purposes.

When personal information is no longer required, we will securely delete, anonymize, or otherwise dispose of it in accordance with applicable law.`,
  },
  {
    number: 12,
    title: "Security",
    body: `Protecting user information is an important priority.

We implement reasonable administrative, technical, and organizational safeguards designed to protect personal information against:

- unauthorized access;
- unauthorized disclosure;
- alteration;
- destruction;
- misuse; and
- accidental loss.

Despite these safeguards, no method of electronic transmission or electronic storage can be guaranteed to be completely secure.

Accordingly, while we strive to protect personal information, we cannot guarantee absolute security.

Users are responsible for maintaining the confidentiality of their account credentials and for notifying us immediately of any suspected unauthorized access to their accounts.`,
  },
  {
    number: 13,
    title: "Children, Minors, and Parental Consent",
    body: `High School Prospect is intended for student-athletes who are at least fourteen (14) years of age.

We do not knowingly permit children under the age of fourteen (14) to create accounts or use the Platform.

Users who are under eighteen (18) years of age must have the permission and consent of a parent or legal guardian before creating or using an account.

Parents and legal guardians may be required to provide information necessary to verify consent and manage the student's account.

If we become aware that personal information has been collected from a child under the age of fourteen (14) without appropriate authorization, we will take reasonable steps to delete such information as soon as practicable.

If you believe that a child under fourteen (14) has provided personal information to High School Prospect, please contact us promptly so that we may investigate and take appropriate action.`,
  },
  {
    number: 14,
    title: "Your Privacy Rights",
    body: `Depending on your location and applicable law, you may have certain rights regarding your personal information.

These rights may include:

- requesting access to your personal information;
- requesting correction of inaccurate or incomplete information;
- requesting deletion of your personal information;
- requesting restrictions on certain processing activities;
- objecting to certain uses of your information;
- requesting a copy of your personal information in a portable format where applicable; and
- withdrawing consent where processing is based on consent.

We will respond to verifiable requests in accordance with applicable law.

To protect the privacy and security of our users, we may request additional information to verify your identity before processing certain requests.

Residents of certain jurisdictions, including California, may have additional privacy rights under applicable state law. Users located in the European Economic Area (EEA), the United Kingdom, Switzerland, or other jurisdictions with applicable privacy laws may also have additional rights as provided by those laws.

High School Prospect does not sell personal information for monetary compensation.

To exercise your privacy rights, please contact us using the information provided at the end of this Privacy Policy.`,
  },
  {
    number: 15,
    title: "International Users",
    body: `High School Prospect is owned and operated in the United States. Although High School Prospect welcomes users from around the world, the Platform is primarily designed to facilitate recruiting opportunities within the United States.

If you access the Platform from outside the United States, you understand that your information may be transferred to, processed, and stored in the United States or in other jurisdictions where our authorized service providers operate.

These jurisdictions may have privacy laws that differ from those of your country of residence.

By using the Platform, you acknowledge and consent to such transfers where permitted by applicable law.

Where required, we implement reasonable safeguards designed to protect personal information transferred across international borders.`,
  },
  {
    number: 16,
    title: "Account Deletion",
    body: `Users may request deletion of their accounts at any time.

Upon receiving a verified deletion request, we will take reasonable steps to:

- deactivate the account;
- remove publicly visible profile information;
- delete or anonymize personal information where appropriate; and
- comply with applicable legal obligations regarding record retention.

Certain information may be retained for a limited period where necessary to:

- comply with legal requirements;
- resolve disputes;
- enforce our agreements;
- prevent fraud or abuse;
- maintain security; or
- protect the rights of High School Prospect, its users, or third parties.

Deletion of an account may not immediately remove information that has already been shared with other users, included in backups, or retained as required by law.`,
  },
  {
    number: 17,
    title: "Changes to This Privacy Policy",
    body: `We may update this Privacy Policy from time to time to reflect:

- changes in applicable laws;
- new Platform features;
- operational improvements;
- security enhancements; or
- changes in our business practices.

When material changes are made, we will update the "Effective Date" shown at the top of this Privacy Policy.

Where required by applicable law, we may provide additional notice before certain changes become effective.

Your continued use of the Platform after any updated Privacy Policy becomes effective constitutes your acknowledgment of the revised Privacy Policy.`,
  },
  {
    number: 18,
    title: "Contact Information",
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:`,
    extra: (
      <>
        {CONTACT_CARD}
        <p className="text-hsp-gray text-sm md:text-base leading-relaxed">
          We will make reasonable efforts to respond to privacy-related inquiries as promptly as practicable and in
          accordance with applicable law.
        </p>
      </>
    ),
  },
];

function sectionId(number: number) {
  return `section-${number}`;
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-hsp-dark">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function renderRichText(body: string): ReactNode[] {
  const blocks = body.trim().split(/\n\s*\n/);

  return blocks.map((raw, i) => {
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const isList = lines.length > 0 && lines.every((line) => line.startsWith("- "));
    const isSubHeading = lines.length === 1 && lines[0].startsWith("### ");

    if (isSubHeading) {
      return (
        <p key={i} className="text-hsp-gray text-sm md:text-base leading-relaxed">
          {renderInline(lines[0].slice(4))}
        </p>
      );
    }

    if (isList) {
      return (
        <ul key={i} className="flex flex-col gap-2 pl-1">
          {lines.map((line, j) => (
            <li
              key={j}
              className="flex items-start gap-2 text-hsp-gray text-sm md:text-base leading-relaxed"
            >
              <span className="text-hsp-red font-bold mt-0.5 shrink-0">·</span>
              <span>{renderInline(line.slice(2))}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="text-hsp-gray text-sm md:text-base leading-relaxed">
        {renderInline(lines.join(" "))}
      </p>
    );
  });
}

const TOC_SECTIONS: PrivacySectionRef[] = PRIVACY_SECTIONS.map((section) => ({
  id: sectionId(section.number),
  number: section.number,
  title: section.title,
}));

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-16">
      {/* Page header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-hsp-dark mb-3">
          Privacy <span className="text-hsp-red">Policy</span>
        </h1>
        <p className="text-hsp-gray text-sm pl-3">Effective Date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="md:flex md:gap-10 lg:gap-14">
        <PrivacyTableOfContents
          sections={TOC_SECTIONS}
          effectiveDate={EFFECTIVE_DATE}
          supportEmail={SUPPORT_EMAIL}
        />

        <div className="min-w-0 flex-1 flex flex-col gap-10 md:gap-12 max-w-[760px]">
          {PRIVACY_SECTIONS.map((section) => (
            <section
              key={section.number}
              id={sectionId(section.number)}
              className="flex flex-col gap-3 scroll-mt-36 md:scroll-mt-24"
            >
              <h2 className="text-lg md:text-xl font-bold text-hsp-dark">
                {section.number}. {section.title}
              </h2>
              {renderRichText(section.body)}
              {section.extra}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
