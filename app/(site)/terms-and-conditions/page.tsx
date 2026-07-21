import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fragment } from "react";
import TermsTableOfContents, { type TermsSectionRef } from "./TermsTableOfContents";

export const metadata: Metadata = {
  title: "Terms and Conditions | High School Prospect",
  description:
    "Read the High School Prospect Terms and Conditions governing use of the platform and its services.",
};

const EFFECTIVE_DATE = "July 20, 2026";
const SUPPORT_EMAIL = "support@highschoolprospect.com";

type TermsSection = {
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

const TERMS_SECTIONS: TermsSection[] = [
  {
    number: 1,
    title: "Introduction",
    body: `Welcome to High School Prospect ("High School Prospect," "we," "our," or "us"), a recruiting platform owned and operated by Ripoll Services, LLC, a Florida limited liability company doing business as High School Prospect.

These Terms and Conditions ("Terms") govern your access to and use of the High School Prospect website, mobile applications (if applicable), services, software, databases, communications, content, features, and any future products or services we make available (collectively, the "Platform").

By accessing, browsing, creating an account, subscribing, or otherwise using the Platform, you acknowledge that you have read, understood, and agree to be legally bound by these Terms, our Privacy Policy, and any additional policies that may be incorporated by reference.

If you do not agree with these Terms, you must discontinue use of the Platform immediately.`,
  },
  {
    number: 2,
    title: "About High School Prospect",
    body: `High School Prospect is an online recruiting platform designed primarily for high school student-athletes and recent graduates who continue to participate in the recruiting process, connecting them with verified college coaches and verified professional scouts.

The Platform is intended to help student-athletes showcase their academic and athletic achievements while providing coaches and scouts with tools to discover recruiting prospects.

Features may include, but are not limited to:

- Athlete recruiting profiles
- Academic information
- Athletic statistics
- Photos and videos
- College search tools
- Internal messaging
- Recruiting resources
- Premium subscription services
- Educational content
- Future products, services, and features introduced by High School Prospect

High School Prospect serves solely as a technology platform.

We are **not**:

- a university;
- a college;
- an athletic conference;
- the NCAA, NAIA, NJCAA, NFHS, or any governing body;
- a recruiting agency;
- a sports agent;
- a scholarship provider;
- or a representative of any educational institution.

Nothing on the Platform guarantees athletic recruitment, scholarships, roster positions, admissions, financial aid, or communication from any coach or institution.`,
  },
  {
    number: 3,
    title: "Definitions",
    body: `For purposes of these Terms:

**Account** means any registered account created on the Platform.

**Athlete** means a student-athlete or recent graduate who creates or maintains a recruiting profile.

**Parent or Guardian** means the legal parent or legal guardian authorized to provide consent for a minor.

**Coach** means a verified college coach approved by High School Prospect.

**Scout** means a verified professional scout approved by High School Prospect.

**Content** includes all text, photographs, videos, graphics, statistics, rankings, comments, messages, documents, software, logos, trademarks, data, and other materials appearing on or submitted through the Platform.

**Subscription** means any paid membership that provides additional Platform features.`,
  },
  {
    number: 4,
    title: "Eligibility",
    body: `The Platform may be used by:

- Student-athletes
- Parents or legal guardians
- Verified college coaches
- Verified professional scouts

By creating an account, you represent and warrant that:

- all information you provide is accurate;
- you have the legal capacity to enter into these Terms;
- you will maintain the accuracy of your information;
- you will comply with all applicable laws while using the Platform.

We reserve the right to refuse registration or terminate any account at our sole discretion.`,
  },
  {
    number: 5,
    title: "Minimum Age and Parental Consent",
    body: `High School Prospect is **not intended for children under the age of 13.**

Student-athletes who are **14 years of age or older** may create and maintain a recruiting profile on the Platform.

Student-athletes who are under the age of 18 may use the Platform only with the permission and involvement of a parent or legal guardian.

Student-athletes who are **18 years of age or older**, including individuals who remain enrolled in high school or who recently graduated and continue participating in the recruiting process, may manage their own accounts without parental consent unless otherwise required by applicable law.

By creating or maintaining an account for a minor, the parent or legal guardian represents that:

- they have legal authority to provide consent;
- they authorize the creation and maintenance of the student's profile;
- they consent to the collection, use, storage, and processing of the student's information as described in these Terms and our Privacy Policy.

If we determine that an account has been created in violation of this section, we reserve the right to suspend or permanently remove the account.`,
  },
  {
    number: 6,
    title: "Parent and Guardian Access",
    body: `Parents and legal guardians play an important role in the recruiting process.

For student-athletes under the age of 18, a parent or legal guardian may assist in creating, updating, managing, and monitoring the student's recruiting profile.

Parents do not receive a separate recruiting profile. Instead, they are authorized users of the student's account for purposes of managing the student's information.

Parents are responsible for ensuring that information submitted on behalf of the student is accurate, truthful, and kept up to date.`,
  },
  {
    number: 7,
    title: "Coach and Scout Verification",
    body: `Protecting student-athletes is one of our highest priorities.

Access to athlete recruiting information is restricted to coaches and scouts who successfully complete High School Prospect's verification process.

Verification may include, but is not limited to:

- employment verification;
- institutional affiliation;
- organization verification;
- professional credentials;
- identity verification;
- official email verification;
- additional documentation requested by High School Prospect.

Submitting a verification request does **not** guarantee approval.

High School Prospect reserves the exclusive right to approve, deny, suspend, revoke, or re-evaluate any verification request at any time and for any reason permitted by law.

Verification status may also be revoked if information becomes inaccurate or if a user violates these Terms.`,
  },
  {
    number: 8,
    title: "Account Registration and Security",
    body: `Users agree to:

- provide truthful registration information;
- maintain only one personal account unless expressly authorized;
- safeguard usernames and passwords;
- immediately notify High School Prospect of unauthorized account access;
- remain responsible for all activity occurring under their account.

Accounts may not be transferred, sold, rented, licensed, or assigned without our prior written consent.

Users are solely responsible for maintaining the confidentiality of their login credentials.`,
  },
  {
    number: 9,
    title: "Athlete Profiles",
    body: `Athletes may create recruiting profiles that include information such as:

- name;
- graduation year;
- city and state;
- athletic position(s);
- height and weight;
- batting and throwing preferences;
- athletic statistics;
- GPA;
- standardized test scores;
- intended college major;
- awards and achievements;
- photographs;
- recruiting videos;
- social media accounts;
- parent information;
- high school coach information.

Users are solely responsible for ensuring that all submitted information is truthful, accurate, current, and supported by legitimate records where applicable.

High School Prospect does not independently verify every statistic, ranking, award, transcript, athletic accomplishment, or academic achievement submitted by users.`,
  },
  {
    number: 10,
    title: "Public Profiles",
    body: `High School Prospect may make certain portions of an athlete's recruiting profile publicly viewable to increase recruiting exposure.

Public information may include:

- athlete name;
- profile photograph;
- city and state;
- graduation year;
- athletic position;
- height;
- weight.

Unless specifically authorized by the user or required by law, High School Prospect will not intentionally display personal contact information, parent information, coach information, or other private profile details as part of the public profile.

The content displayed publicly may evolve as the Platform introduces new features.`,
  },
  {
    number: 11,
    title: "Promotional Consent",
    body: `High School Prospect may invite athletes, parents, coaches, or scouts to voluntarily participate in promotional activities.

Participation is completely optional and is not required to create an account or maintain any subscription.

If a user grants promotional consent, High School Prospect may use approved photographs, videos, profile information, athletic accomplishments, testimonials, or related content in:

- the Platform;
- official social media accounts;
- newsletters;
- advertisements;
- presentations;
- promotional campaigns;
- educational materials.

Users may withdraw promotional consent at any time by contacting High School Prospect or updating their account settings when available.

Withdrawal of consent will apply prospectively and will not require removal of content already published before the withdrawal request was received.`,
  },
  {
    number: 12,
    title: "Accuracy of Information",
    body: `Maintaining accurate recruiting information benefits every participant on the Platform.

Users agree that all information they submit will be truthful, accurate, complete, and current.

Users may not knowingly submit:

- false athletic statistics;
- altered academic records;
- misleading rankings;
- fabricated awards;
- impersonated identities;
- manipulated photographs;
- misleading recruiting videos;
- inaccurate school information;
- or any other deceptive content.

High School Prospect reserves the right to investigate suspected fraudulent activity and may suspend or permanently terminate accounts that intentionally provide false or misleading information.

Where appropriate, High School Prospect may cooperate with educational institutions, athletic organizations, law enforcement agencies, or other authorized entities during investigations involving fraud, identity theft, or other unlawful conduct.`,
  },
  {
    number: 13,
    title: "User Content",
    body: `Users retain ownership of the original content they upload to the Platform, including photographs, videos, athletic statistics, academic information, written descriptions, and other materials ("User Content").

By uploading User Content, you represent and warrant that:

- you own the content or have all necessary rights and permissions to upload it;
- the content does not infringe any copyright, trademark, privacy, publicity, or other legal rights;
- the content is accurate and not misleading;
- the content complies with these Terms and all applicable laws.

Users remain solely responsible for all User Content they submit.`,
  },
  {
    number: 14,
    title: "License Granted to High School Prospect",
    body: `By uploading User Content, you grant High School Prospect a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to:

- host;
- store;
- reproduce;
- display;
- distribute;
- format;
- optimize;
- back up;
- transmit;
- and otherwise use your content solely for the operation, improvement, security, promotion (when promotional consent has been granted), and maintenance of the Platform.

This license ends when your content is permanently removed from our systems, except where retention is required by law, backup procedures, fraud prevention, dispute resolution, or legal compliance.

Nothing in these Terms transfers ownership of your original content to High School Prospect.`,
  },
  {
    number: 15,
    title: "Photos and Videos",
    body: `Student-athletes may upload photographs and recruiting videos in accordance with the Platform's technical requirements.

Users agree that:

- uploaded media accurately represents the athlete;
- media has not been materially manipulated in a misleading manner;
- uploaded media does not violate another person's rights;
- uploaded media complies with all applicable laws.

High School Prospect reserves the right to remove media that is:

- offensive;
- misleading;
- sexually explicit;
- violent;
- abusive;
- defamatory;
- fraudulent;
- copyrighted without authorization;
- or otherwise inappropriate.

Repeated violations may result in permanent account termination.`,
  },
  {
    number: 16,
    title: "Artificial Intelligence, Deepfakes, and Manipulated Content",
    body: `Because recruiting decisions rely on accurate information, High School Prospect prohibits deceptive uses of artificial intelligence.

Users may not upload or distribute content that:

- falsely alters athletic performance;
- manipulates game footage to misrepresent skill level;
- creates fake awards or rankings;
- fabricates offers from colleges;
- impersonates another athlete, coach, scout, or institution;
- generates misleading deepfake videos or audio recordings.

Reasonable editing such as brightness adjustment, cropping, trimming, stabilization, subtitles, or compression is permitted provided the content does not materially misrepresent the athlete.

Violation of this section may result in immediate account suspension or permanent removal.`,
  },
  {
    number: 17,
    title: "Intellectual Property",
    body: `Except for User Content owned by users, all intellectual property associated with the Platform — including but not limited to:

- software;
- source code;
- databases;
- design;
- graphics;
- logos;
- icons;
- trademarks;
- service marks;
- page layouts;
- functionality;
- written materials;
- audiovisual content;
- and other proprietary materials —

is owned by High School Prospect, Ripoll Services, LLC, or its licensors.

No ownership rights are transferred through use of the Platform.`,
  },
  {
    number: 18,
    title: "Copyright Policy (DMCA)",
    body: `High School Prospect respects intellectual property rights.

If you believe copyrighted material has been posted without authorization, you may submit a copyright complaint containing:

- identification of the copyrighted work;
- identification of the allegedly infringing material;
- your contact information;
- a statement made under penalty of perjury that your claim is accurate;
- your physical or electronic signature.

High School Prospect reserves the right to remove allegedly infringing content while investigating the claim.

Users who repeatedly infringe copyrights may have their accounts permanently terminated.

A complete DMCA Policy will also be published separately and incorporated into these Terms by reference.`,
  },
  {
    number: 19,
    title: "Internal Messaging",
    body: `Verified coaches and verified professional scouts may communicate with student-athletes through the Platform's messaging features.

Users agree that messaging may not be used for:

- harassment;
- discrimination;
- threats;
- spam;
- solicitation unrelated to recruiting;
- illegal activities;
- fraudulent conduct;
- distribution of malware or harmful links.

High School Prospect reserves the right, consistent with applicable law and our Privacy Policy, to investigate reports of abuse and to suspend messaging privileges when necessary to protect users or the integrity of the Platform.

We are not responsible for the content of communications exchanged between users.`,
  },
  {
    number: 20,
    title: "FERPA, COPPA, and Student Privacy",
    body: `High School Prospect recognizes the importance of protecting student information.

The Platform is designed to respect applicable privacy laws, including, where applicable:

- the Family Educational Rights and Privacy Act (FERPA);
- the Children's Online Privacy Protection Act (COPPA); and
- other applicable federal, state, or local privacy laws.

High School Prospect does not require schools to disclose education records protected by FERPA.

Student-athletes and parents are responsible for ensuring that any educational information they choose to upload may be lawfully shared.

For users under 18 years of age, parental involvement and consent are required as described in these Terms and our Privacy Policy.

Nothing in these Terms should be interpreted as creating obligations beyond those imposed by applicable law.`,
  },
  {
    number: 21,
    title: "NCAA, NAIA, NJCAA, and Eligibility Disclaimer",
    body: `High School Prospect is an independent technology platform.

We do not determine, certify, monitor, or guarantee an athlete's eligibility under the rules of:

- NCAA;
- NAIA;
- NJCAA;
- NFHS;
- state athletic associations;
- conferences;
- colleges;
- universities;
- or any other governing organization.

Athletes are solely responsible for understanding and complying with all eligibility requirements established by the institutions and organizations with which they interact.

Information available on the Platform is provided for general informational purposes only and should not be considered eligibility, compliance, recruiting, admissions, or legal advice.

Users should consult the appropriate educational institution or governing body regarding specific eligibility questions.`,
  },
  {
    number: 22,
    title: "Acceptable Use",
    body: `Users agree to use the Platform responsibly and lawfully.

Users may not:

- impersonate another person or organization;
- create fake accounts;
- submit fraudulent information;
- interfere with Platform security;
- attempt unauthorized access to systems;
- distribute viruses or malicious code;
- engage in phishing;
- scrape or harvest data without written permission;
- reverse engineer the Platform;
- copy substantial portions of the Platform;
- use automated bots without authorization;
- interfere with another user's experience;
- attempt to circumvent subscription features or security measures;
- use the Platform for any unlawful purpose.

High School Prospect may investigate violations and take any action it deems appropriate, including account suspension, permanent termination, legal action, or cooperation with law enforcement.`,
  },
  {
    number: 23,
    title: "Subscription Plans",
    body: `Certain features of High School Prospect may require a paid subscription.

Subscription plans, pricing, available features, billing cycles, and promotional offers may change from time to time at our sole discretion.

Before purchasing a subscription, users will be presented with the applicable pricing and billing terms.

By purchasing a subscription, you agree to pay all applicable fees associated with your selected plan.

Unless otherwise stated, subscriptions grant access only to premium Platform features and do not guarantee recruiting opportunities, communications from coaches, scholarships, roster positions, or athletic advancement.`,
  },
  {
    number: 24,
    title: "Billing and Payment",
    body: `Payments for subscriptions and other paid services are processed through one or more **authorized third-party payment providers** selected by High School Prospect.

High School Prospect does **not** store complete payment card information on its own servers. Payment transactions are securely processed by independent payment providers using industry-standard security measures.

By submitting payment information, you represent and warrant that:

- you are authorized to use the selected payment method;
- all payment information provided is accurate, complete, and current;
- you authorize recurring charges when purchasing a recurring subscription, where applicable;
- you agree to pay all applicable taxes, fees, and other charges required by law.

Failure to successfully process payment may result in the suspension, limitation, or termination of premium features or subscription services.

High School Prospect is not responsible for payment processing errors, service interruptions, delays, or security incidents that occur solely within the systems or infrastructure of independent payment providers, except as otherwise required by applicable law.`,
  },
  {
    number: 25,
    title: "Subscription Renewals",
    body: `Unless otherwise stated at the time of purchase, recurring subscriptions automatically renew at the end of each billing period until canceled.

Users may cancel automatic renewal through their account settings or by following the cancellation instructions provided by High School Prospect.

Cancellation prevents future renewals but does not automatically generate refunds for the current billing period unless required by applicable law.`,
  },
  {
    number: 26,
    title: "Refund Policy",
    body: `Except where prohibited by law or specifically stated otherwise, subscription payments are non-refundable.

High School Prospect may, at its sole discretion, issue full or partial refunds under exceptional circumstances.

Examples may include:

- duplicate billing;
- billing system errors;
- unauthorized transactions verified by investigation.

Requests for refunds should be submitted promptly after the transaction occurs.

Nothing in this section limits any consumer rights that cannot legally be waived.`,
  },
  {
    number: 27,
    title: "No Recruiting Guarantee",
    body: `High School Prospect provides technology that facilitates exposure between student-athletes and verified coaches or scouts.

We do **not** guarantee:

- athletic scholarships;
- college admissions;
- roster opportunities;
- recruitment by any institution;
- tryout invitations;
- coach responses;
- scout evaluations;
- athletic success;
- future earnings;
- professional contracts.

A paid subscription increases access to Platform features only.

Recruiting outcomes depend on many factors beyond our control, including athletic ability, academic performance, institutional needs, eligibility rules, geographic considerations, timing, competition, and decisions made independently by coaches and educational institutions.

No advertisement, promotional material, testimonial, or success story should be interpreted as a promise of similar results.`,
  },
  {
    number: 28,
    title: "Third-Party Services",
    body: `The Platform may integrate with or provide links to third-party websites, products, software, payment providers, social media platforms, cloud service providers, analytics providers, mapping services, video hosting services, communication tools, or other independent services.

These third-party services are operated by independent entities and are not owned or controlled by High School Prospect.

High School Prospect does not endorse, guarantee, or assume responsibility for the availability, accuracy, security, privacy practices, content, products, services, or performance of any third-party provider.

Your use of third-party services is governed solely by the terms, conditions, and privacy policies of the applicable third-party provider.

High School Prospect shall not be liable for any loss, damage, delay, interruption, or other issue arising from your use of or reliance upon any third-party service, except where such liability cannot be excluded under applicable law.`,
  },
  {
    number: 29,
    title: "Anti-Scraping, Data Mining, and Artificial Intelligence",
    body: `To protect student-athletes, coaches, scouts, and the integrity of the Platform, users and third parties may not, without our prior written authorization:

- scrape the Platform;
- harvest athlete profiles;
- copy recruiting databases;
- collect photographs;
- collect videos;
- extract statistics;
- use automated crawlers;
- use spiders;
- use bots;
- mirror the Platform;
- reproduce substantial portions of our database.

Additionally, users and third parties may not use any information, photographs, videos, statistics, or other content from High School Prospect for the purpose of:

- training artificial intelligence models;
- developing machine learning systems;
- creating facial recognition datasets;
- generating synthetic athlete profiles;
- building competing recruiting databases;
- commercial resale.

Unauthorized automated collection of Platform content constitutes a material violation of these Terms and may result in civil and criminal remedies where permitted by law.`,
  },
  {
    number: 30,
    title: "Disclaimer of Warranties",
    body: `The Platform is provided "as is" and "as available."

To the maximum extent permitted by applicable law, High School Prospect disclaims all warranties, whether express, implied, or statutory, including but not limited to:

- merchantability;
- fitness for a particular purpose;
- non-infringement;
- accuracy;
- reliability;
- availability;
- security; and
- continuous operation.

We do not warrant that: the Platform will always be available; communications will always be delivered; uploaded information will never be lost; errors will never occur; defects will always be corrected; or the Platform will meet every user's expectations. Users assume all risks associated with their use of the Platform.`,
  },
  {
    number: 31,
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, High School Prospect, Ripoll Services, LLC, its owners, members, managers, employees, contractors, officers, affiliates, licensors, and service providers shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages arising out of or related to:

- use of the Platform;
- inability to use the Platform;
- loss of data;
- loss of profits;
- loss of opportunities;
- loss of scholarships;
- recruiting decisions;
- college admissions;
- athletic eligibility;
- communications between users;
- actions or omissions of coaches, scouts, or other users;
- third-party services;
- security incidents; or
- unauthorized account access.

To the maximum extent permitted by applicable law, our total aggregate liability for any claim arising out of or relating to the Platform shall not exceed the greater of:

(a) the total amount paid by the user to High School Prospect during the twelve (12) months immediately preceding the claim; or

(b) one hundred U.S. dollars (US $100.00).

Some jurisdictions do not allow certain limitations of liability. In those jurisdictions, these limitations shall apply only to the maximum extent permitted by applicable law.`,
  },
  {
    number: 32,
    title: "Indemnification",
    body: `Users agree to defend, indemnify, and hold harmless High School Prospect, Ripoll Services, LLC, its affiliates, officers, employees, contractors, licensors, successors, and assigns from and against any claims, losses, liabilities, damages, judgments, settlements, penalties, costs, and reasonable attorneys' fees arising from:

- violation of these Terms;
- violation of applicable law;
- infringement of another person's intellectual property rights;
- content uploaded by the user;
- misuse of the Platform;
- negligent or intentional misconduct;
- unauthorized use of another person's identity;
- disputes between users.

This obligation survives termination of the user's account.`,
  },
  {
    number: 33,
    title: "Account Suspension and Termination",
    body: `High School Prospect reserves the right, at its sole discretion, to suspend, restrict, or permanently terminate any account that violates these Terms, applicable laws, or any Platform policies.

Reasons for suspension or termination may include, but are not limited to:

- providing false or misleading information;
- impersonating another individual or organization;
- violating intellectual property rights;
- engaging in harassment, discrimination, or abusive conduct;
- attempting unauthorized access to the Platform;
- fraudulent activity;
- repeated violations of these Terms;
- any conduct that may harm High School Prospect or its users.

Users may also close their accounts at any time by following the account deletion procedures made available by the Platform.

Termination of an account does not relieve the user of any obligations or liabilities incurred prior to termination.`,
  },
  {
    number: 34,
    title: "Data Retention",
    body: `High School Prospect retains user information only for as long as reasonably necessary to:

- operate the Platform;
- provide requested services;
- comply with legal obligations;
- resolve disputes;
- prevent fraud;
- enforce these Terms; and
- protect the security and integrity of the Platform.

When a user requests deletion of an account, High School Prospect will make reasonable efforts to remove or anonymize personal information, except where retention is required or permitted by applicable law.

Certain records, including billing records, security logs, legal correspondence, fraud prevention records, and backup archives, may be retained for a reasonable period following account deletion.

Additional information regarding data retention is provided in our Privacy Policy.`,
  },
  {
    number: 35,
    title: "Security",
    body: `High School Prospect implements commercially reasonable administrative, technical, and organizational safeguards designed to protect user information.

However, no website, application, cloud service, database, network, or method of electronic transmission or storage can be guaranteed to be completely secure.

Accordingly, High School Prospect cannot guarantee absolute security and disclaims liability for unauthorized access or data breaches except to the extent caused by our failure to comply with applicable law.

Users are responsible for protecting their login credentials and for immediately notifying High School Prospect of any suspected unauthorized use of their account.`,
  },
  {
    number: 36,
    title: "Electronic Communications",
    body: `By creating an account or using the Platform, you consent to receive electronic communications from High School Prospect.

These communications may include:

- account notifications;
- security alerts;
- billing information;
- subscription notices;
- legal notices;
- updates to these Terms;
- customer support communications; and
- other operational messages.

You agree that electronic communications satisfy any legal requirement that such communications be in writing.`,
  },
  {
    number: 37,
    title: "Changes to the Platform",
    body: `High School Prospect continually improves and updates the Platform.

Accordingly, we reserve the right to add, modify, suspend, discontinue, replace, or remove any feature, functionality, service, subscription plan, or portion of the Platform at any time without prior notice.

We shall not be liable for any modification, interruption, or discontinuation of any portion of the Platform.`,
  },
  {
    number: 38,
    title: "Changes to These Terms",
    body: `High School Prospect may revise these Terms from time to time.

When material changes are made, we may provide notice through the Platform, by email, or through other reasonable means.

The updated Effective Date will appear at the beginning of these Terms.

Your continued use of the Platform after revised Terms become effective constitutes your acceptance of those changes.

If you do not agree with the revised Terms, you must discontinue use of the Platform.`,
  },
  {
    number: 39,
    title: "Governing Law",
    body: `These Terms shall be governed by and interpreted in accordance with the laws of the State of Florida, without regard to its conflict of law principles.

Any legal action not subject to arbitration shall be brought exclusively in the appropriate state or federal courts located in the State of Florida, and the parties consent to the jurisdiction of those courts.`,
  },
  {
    number: 40,
    title: "Dispute Resolution",
    body: `Before initiating formal legal proceedings, the parties agree to make a good-faith effort to resolve any dispute through informal discussions.

If a dispute cannot be resolved informally, either party may pursue any legal remedies available under applicable law.

Nothing in this section limits any rights that cannot legally be waived.`,
  },
  {
    number: 41,
    title: "Force Majeure",
    body: `High School Prospect shall not be liable for any delay or failure to perform resulting from causes beyond its reasonable control, including but not limited to:

- natural disasters;
- hurricanes;
- floods;
- fires;
- earthquakes;
- pandemics;
- acts of government;
- war;
- terrorism;
- labor disputes;
- utility failures;
- Internet outages;
- cyberattacks;
- failures of third-party service providers; or
- other events beyond our reasonable control.

Performance shall be suspended for the duration of the affected event.`,
  },
  {
    number: 42,
    title: "Assignment",
    body: `High School Prospect may assign, transfer, or delegate its rights and obligations under these Terms in connection with a merger, acquisition, corporate restructuring, sale of assets, financing transaction, or by operation of law.

Users may not assign or transfer their rights or obligations under these Terms without the prior written consent of High School Prospect.`,
  },
  {
    number: 43,
    title: "Severability",
    body: `If any provision of these Terms is determined by a court of competent jurisdiction to be invalid, illegal, or unenforceable, the remaining provisions shall remain in full force and effect.

The invalid provision shall be interpreted, to the maximum extent permitted by law, in a manner that most closely reflects its original intent.`,
  },
  {
    number: 44,
    title: "No Waiver",
    body: `Failure by High School Prospect to enforce any provision of these Terms shall not constitute a waiver of that provision or of any other rights.

Any waiver shall be effective only if made in writing and signed by an authorized representative of High School Prospect.`,
  },
  {
    number: 45,
    title: "Entire Agreement",
    body: `These Terms, together with our Privacy Policy and any additional policies expressly incorporated by reference, constitute the entire agreement between you and High School Prospect regarding your use of the Platform.

They supersede all prior or contemporaneous agreements, communications, representations, or understandings relating to the Platform.`,
  },
  {
    number: 46,
    title: "Survival",
    body: `The provisions of these Terms that by their nature should survive termination of an account or the end of your use of the Platform shall remain in effect, including but not limited to provisions relating to:

- intellectual property;
- user content licenses;
- payment obligations;
- disclaimers of warranties;
- limitation of liability;
- indemnification;
- dispute resolution;
- governing law;
- and any other provisions intended to survive termination.`,
  },
  {
    number: 47,
    title: "No Professional Advice",
    body: `The information, articles, resources, educational materials, recruiting guidance, and other content made available through High School Prospect are provided for general informational purposes only.

Nothing on the Platform constitutes legal, financial, tax, accounting, medical, recruiting, admissions, compliance, or professional advice.

Users should seek advice from qualified professionals regarding their individual circumstances.

High School Prospect makes no representation that any information provided through the Platform is appropriate for every user's specific situation.`,
  },
  {
    number: 48,
    title: "Contact Information",
    body: `If you have any questions regarding these Terms, you may contact us at:`,
    extra: (
      <>
        {CONTACT_CARD}
        <p className="text-hsp-gray text-sm md:text-base leading-relaxed">
          By creating an account, accessing, or using the Platform, you acknowledge that you have read, understood,
          and agree to be bound by these Terms and Conditions.
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

const TOC_SECTIONS: TermsSectionRef[] = TERMS_SECTIONS.map((section) => ({
  id: sectionId(section.number),
  number: section.number,
  title: section.title,
}));

export default function TermsAndConditionsPage() {
  return (
    <div className="pb-16">
      {/* Page header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-hsp-dark mb-3">
          Terms and <span className="text-hsp-red">Conditions</span>
        </h1>
        <p className="text-hsp-gray text-sm pl-3">Effective Date: {EFFECTIVE_DATE}</p>
      </div>

      <div className="md:flex md:gap-10 lg:gap-14">
        <TermsTableOfContents
          sections={TOC_SECTIONS}
          effectiveDate={EFFECTIVE_DATE}
          supportEmail={SUPPORT_EMAIL}
        />

        <div className="min-w-0 flex-1 flex flex-col gap-10 md:gap-12 max-w-[760px]">
          {TERMS_SECTIONS.map((section) => (
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
