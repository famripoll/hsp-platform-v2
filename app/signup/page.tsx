"use client";

import Link from "next/link";
import { useState } from "react";

type AccountType = "student" | "parent" | "coach";

const STEPS = ["Account", "Details", "Verify"] as const;

const ACCOUNT_CARDS: {
  id: AccountType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "student",
    label: "Student-Athlete",
    icon: "⚾",
    description:
      "Build your recruit-ready profile and connect with college coaches.",
  },
  {
    id: "parent",
    label: "Parent / Guardian",
    icon: "👨‍👩‍👦",
    description:
      "Support your athlete and stay informed every step of the way.",
  },
  {
    id: "coach",
    label: "College Coach",
    icon: "🎓",
    description:
      "Discover and evaluate verified high school prospects nationwide.",
  },
];

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const DIVISIONS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "NJCAA"];
const RELATIONSHIPS = ["Mother", "Father", "Guardian"];

function InputField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-hsp-dark">{label}</label>
      <input
        {...props}
        className="bg-hsp-card rounded-lg px-4 py-3 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
      />
    </div>
  );
}

function SelectField({
  label,
  options,
  ...props
}: {
  label: string;
  options: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-hsp-dark">{label}</label>
      <select
        {...props}
        className="bg-hsp-card rounded-lg px-4 py-3 text-sm text-hsp-dark focus:outline-none focus:ring-2 focus:ring-hsp-red"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  function selectAccount(type: AccountType) {
    setAccountType(type);
    setStep(2);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  return (
    <div>
      {/* Hero — breaks out of layout padding to go full-width */}
      <section className="bg-hsp-dark -mx-4 -mt-4 md:-mx-8 md:-mt-8 px-4 py-12 md:py-16 text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
          Start Your Recruiting Journey
        </h1>
        <p className="text-hsp-gray text-base md:text-lg">
          Free to join. Set up your profile in under 5 minutes!
        </p>
      </section>

      {/* Progress Stepper */}
      <div className="flex items-start justify-center mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center w-20">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                  step >= i + 1
                    ? "bg-hsp-red text-white"
                    : "bg-hsp-card text-hsp-gray"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium text-center ${
                  step >= i + 1 ? "text-hsp-dark" : "text-hsp-gray"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-[2px] w-12 mt-4 transition-colors duration-300 ${
                  step > i + 1 ? "bg-hsp-red" : "bg-hsp-card"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Account type selection */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-hsp-dark text-center mb-8">
            I am a…
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            {ACCOUNT_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => selectAccount(card.id)}
                className="flex-1 bg-hsp-card rounded-2xl p-6 flex flex-col items-center text-center gap-3 border-2 border-transparent hover:border-hsp-red hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <span className="text-4xl">{card.icon}</span>
                <h3 className="font-bold text-hsp-dark text-base">
                  {card.label}
                </h3>
                <p className="text-hsp-gray text-sm">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Dynamic form */}
      {step === 2 && accountType && (
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-hsp-dark text-center mb-8">
            {accountType === "student" && "Student-Athlete Details"}
            {accountType === "parent" && "Parent / Guardian Details"}
            {accountType === "coach" && "College Coach Details"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <InputField
              label="Full Name"
              type="text"
              required
              placeholder="John Smith"
            />

            {accountType === "student" && (
              <>
                <InputField
                  label="Email"
                  type="email"
                  required
                  placeholder="you@email.com"
                />
                <InputField
                  label="Password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
                <SelectField label="Grade" options={GRADES} required />
                <InputField
                  label="High School Name"
                  type="text"
                  required
                  placeholder="Lincoln High School"
                />
                <InputField
                  label="City / State"
                  type="text"
                  required
                  placeholder="Miami, FL"
                />
                <InputField
                  label="Parent / Guardian Email"
                  type="email"
                  required
                  placeholder="parent@email.com"
                />
              </>
            )}

            {accountType === "coach" && (
              <>
                <InputField
                  label="University Email (.edu only)"
                  type="email"
                  required
                  placeholder="coach@university.edu"
                  pattern="^[^@]+@[^@]+\.edu$"
                  title="Must be a .edu email address"
                />
                <InputField
                  label="University Name"
                  type="text"
                  required
                  placeholder="State University"
                />
                <SelectField label="Division" options={DIVISIONS} required />
                <InputField
                  label="State"
                  type="text"
                  required
                  placeholder="Florida"
                />
              </>
            )}

            {accountType === "parent" && (
              <>
                <InputField
                  label="Email"
                  type="email"
                  required
                  placeholder="you@email.com"
                />
                <InputField
                  label="Password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
                <SelectField
                  label="Relationship"
                  options={RELATIONSHIPS}
                  required
                />
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-24 py-3 rounded-lg border-2 border-hsp-card text-hsp-gray text-sm font-semibold hover:border-hsp-gray hover:text-hsp-dark transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3 — Verify */}
      {step === 3 && (
        <div className="max-w-md mx-auto text-center py-8 flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-hsp-card rounded-full flex items-center justify-center text-3xl">
            ✉
          </div>
          <h2 className="text-2xl font-bold text-hsp-dark">
            Check your inbox
          </h2>
          <p className="text-hsp-gray text-sm leading-relaxed">
            We sent a verification link to your email. Click the link to
            activate your account and begin your recruiting journey.
          </p>
        </div>
      )}

      {/* Bottom links */}
      <div className="text-center mt-10 mb-6 flex flex-col gap-3">
        <p className="text-hsp-gray text-xs">
          By signing up, you agree to our{" "}
          <Link
            href="/terms-and-conditions"
            className="text-hsp-red font-medium hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-hsp-red font-medium hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-hsp-gray text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-hsp-dark font-semibold hover:text-hsp-red transition-colors duration-150"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
