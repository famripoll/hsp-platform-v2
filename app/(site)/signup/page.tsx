"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AccountType = "student" | "coach";

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
    id: "coach",
    label: "College Coach",
    icon: "🎓",
    description:
      "Discover and evaluate verified high school prospects nationwide.",
  },
];

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const DIVISIONS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "NJCAA"];
const PARENT_RELATIONSHIPS = ["Mother", "Father", "Grandparent", "Guardian", "Sibling", "Other"];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const [formData, setFormData] = useState({
    full_name: "", email: "", password: "",
    high_school: "", city: "", state: "", grade: "", parent_email: "", parent_name: "",
    parent_phone: "", parent_relationship: "", parent_relationship_other: "",
    phone: "", university: "", division: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function selectAccount(type: AccountType) {
    setAccountType(type);
    setError(null);
    setStep(2);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPhoneError(null);

    if (accountType === "coach") {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length !== 10) {
        setPhoneError("Please enter a valid 10-digit US phone number.");
        return;
      }
    }

    if (accountType === "coach" && !formData.email.endsWith(".edu")) {
      setError("Please use your official university email (.edu)");
      return;
    }

    setLoading(true);

    let graduationYear: string | undefined;
    if (accountType === "student" && formData.grade) {
      const currentYear = new Date().getFullYear();
      const gradeNumber = parseInt(formData.grade.replace("Grade ", ""));
      graduationYear = String(currentYear + (12 - gradeNumber));
    }

    try {
      const resolvedParentRelationship =
        formData.parent_relationship === "Other"
          ? formData.parent_relationship_other.trim()
          : formData.parent_relationship;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: accountType,
          ...(accountType === "student" && {
            high_school: formData.high_school,
            city: formData.city,
            state: formData.state,
            grade: formData.grade,
            graduation_year: graduationYear,
            parent_email: formData.parent_email,
            parent_name: formData.parent_name,
            parent_phone: formData.parent_phone,
            parent_relationship: resolvedParentRelationship,
          }),
          ...(accountType === "coach" && {
            phone: formData.phone,
            university: formData.university,
            division: formData.division,
            state: formData.state,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (accountType === "student") {
        setSuccessMessage(
          "Account created successfully! Please log in to continue."
        );
        setStep(3);
      } else if (accountType === "coach") {
        setSuccessMessage("Your account is pending manual verification.");
        setStep(3);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Start</span>{" "}
          <span className="text-hsp-dark">Your Recruiting Journey</span>
        </h1>
        <p className="text-[#64748b] text-base md:text-lg">
          Set up your profile in under 5 minutes!
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
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {ACCOUNT_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => selectAccount(card.id)}
                className="flex-1 max-w-xs bg-hsp-card rounded-2xl p-6 flex flex-col items-center text-center gap-3 border-2 border-transparent hover:border-hsp-red hover:shadow-xl transition-all duration-300 cursor-pointer"
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

      {/* Step 2 — Details form */}
      {step === 2 && accountType && (
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-hsp-dark text-center mb-8">
            {accountType === "student" && "Student-Athlete Details"}
            {accountType === "coach" && "College Coach Details"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <InputField
              label="Full Name"
              type="text"
              name="full_name"
              required
              placeholder="John Smith"
              value={formData.full_name}
              onChange={handleChange}
            />

            {accountType === "student" && (
              <>
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  required
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <SelectField
                  label="Grade"
                  options={GRADES}
                  required
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                />
                <InputField
                  label="High School Name"
                  type="text"
                  name="high_school"
                  required
                  placeholder="Lincoln High School"
                  value={formData.high_school}
                  onChange={handleChange}
                />
                <InputField
                  label="City"
                  type="text"
                  name="city"
                  required
                  placeholder="Miami"
                  value={formData.city}
                  onChange={handleChange}
                />
                <InputField
                  label="State"
                  type="text"
                  name="state"
                  required
                  placeholder="Florida"
                  value={formData.state}
                  onChange={handleChange}
                />
                <InputField
                  label="Parent / Guardian Full Name"
                  type="text"
                  name="parent_name"
                  required
                  placeholder="Mike Smith"
                  value={formData.parent_name}
                  onChange={handleChange}
                />
                <InputField
                  label="Parent / Guardian Email"
                  type="email"
                  name="parent_email"
                  required
                  placeholder="parent@email.com"
                  value={formData.parent_email}
                  onChange={handleChange}
                />
                <InputField
                  label="Parent / Guardian Phone"
                  type="text"
                  name="parent_phone"
                  required
                  placeholder="239-123-4567"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parent_phone: formatPhone(e.target.value) }))}
                />
                <SelectField
                  label="Relationship to Student"
                  options={PARENT_RELATIONSHIPS}
                  required
                  name="parent_relationship"
                  value={formData.parent_relationship}
                  onChange={handleChange}
                />
                {formData.parent_relationship === "Other" && (
                  <InputField
                    label="Please specify"
                    type="text"
                    name="parent_relationship_other"
                    required
                    placeholder="e.g. Aunt, Family Friend"
                    value={formData.parent_relationship_other}
                    onChange={handleChange}
                  />
                )}
              </>
            )}

            {accountType === "coach" && (
              <>
                <div className="flex flex-col gap-1">
                  <InputField
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    required
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      let formatted = digits;
                      if (digits.length > 6) formatted = digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
                      else if (digits.length > 3) formatted = digits.slice(0, 3) + "-" + digits.slice(3);
                      setFormData((prev) => ({ ...prev, phone: formatted }));
                    }}
                  />
                  {phoneError && (
                    <p className="text-sm text-red-600">{phoneError}</p>
                  )}
                </div>
                <InputField
                  label="University Email"
                  type="email"
                  name="email"
                  required
                  placeholder="coach@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
                <InputField
                  label="Password"
                  type="password"
                  name="password"
                  required
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputField
                  label="University Name"
                  type="text"
                  name="university"
                  required
                  placeholder="State University"
                  value={formData.university}
                  onChange={handleChange}
                />
                <SelectField
                  label="Division"
                  options={DIVISIONS}
                  required
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                />
                <InputField
                  label="State"
                  type="text"
                  name="state"
                  required
                  placeholder="Florida"
                  value={formData.state}
                  onChange={handleChange}
                />
              </>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                className="w-24 py-3 rounded-lg border-2 border-hsp-card text-hsp-gray text-sm font-semibold hover:border-hsp-gray hover:text-hsp-dark transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 hover:scale-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Processing..." : "Continue"}
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
            {accountType === "coach" ? "Account Submitted" : "Account Created!"}
          </h2>
          <p className="text-hsp-gray text-sm leading-relaxed">
            {successMessage ??
              "We sent a verification link to your email. Click the link to activate your account and begin your recruiting journey."}
          </p>
          {accountType === "student" && (
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200"
            >
              Go to Login
            </Link>
          )}
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
