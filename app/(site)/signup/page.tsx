"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
const DIVISIONS = ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "NJCAA", "CCCAA", "NCCAA", "USCAA", "NWAC", "LAI"];
const PARENT_RELATIONSHIPS = ["Mother", "Father", "Grandparent", "Guardian", "Sibling", "Other"];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function InputField({
  label,
  inputRef,
  showToggle,
  onToggle,
  ...props
}: {
  label: string;
  inputRef?: React.Ref<HTMLInputElement>;
  showToggle?: boolean;
  onToggle?: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const fieldId = `signup-${props.name}`;

  if (showToggle === undefined) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-semibold text-hsp-dark">{label}</label>
        <input
          {...props}
          ref={inputRef}
          id={fieldId}
          className="bg-hsp-card rounded-lg px-4 py-3 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-hsp-dark">{label}</label>
      <div className="relative">
        <input
          {...props}
          ref={inputRef}
          id={fieldId}
          type={props.type === "password" ? (showToggle ? "text" : "password") : props.type}
          className="w-full bg-hsp-card rounded-lg px-4 py-3 pr-12 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-hsp-gray hover:text-hsp-dark transition-colors duration-150 text-xs font-semibold select-none"
          aria-label={showToggle ? "Hide password" : "Show password"}
        >
          {showToggle ? "Hide" : "Show"}
        </button>
      </div>
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
  const fieldId = `signup-${props.name}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold text-hsp-dark">{label}</label>
      <select
        {...props}
        id={fieldId}
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
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "", email: "", password: "",
    high_school: "", city: "", state: "", grade: "", date_of_birth: "", parent_email: "", parent_name: "",
    parent_phone: "", parent_relationship: "", parent_relationship_other: "",
    phone: "", university: "", division: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previousStepRef = useRef(step);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const accountCardRefs = useRef<Record<AccountType, HTMLButtonElement | null>>({
    student: null,
    coach: null,
  });
  const completionRef = useRef<HTMLDivElement>(null);
  const focusVisibilityFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const previousStep = previousStepRef.current;
    previousStepRef.current = step;

    if (previousStep === 1 && step === 2) {
      fullNameRef.current?.focus();
    } else if (previousStep === 2 && step === 1 && accountType) {
      window.scrollTo({ top: 0, behavior: "instant" });
      accountCardRefs.current[accountType]?.focus({ preventScroll: true });
    } else if (previousStep === 2 && step === 3) {
      completionRef.current?.focus();
    }
  }, [step, accountType]);

  useEffect(() => {
    return () => {
      if (focusVisibilityFrameRef.current !== null) {
        cancelAnimationFrame(focusVisibilityFrameRef.current);
      }
    };
  }, []);

  function keepFocusedControlVisible(e: React.FocusEvent<HTMLFormElement>) {
    const control = e.target;
    const form = e.currentTarget;

    if (focusVisibilityFrameRef.current !== null) {
      cancelAnimationFrame(focusVisibilityFrameRef.current);
    }

    // Measure after native focus scrolling; never move focus or intercept Tab.
    focusVisibilityFrameRef.current = requestAnimationFrame(() => {
      focusVisibilityFrameRef.current = null;
      if (!form.isConnected || !form.contains(control) || document.activeElement !== control) return;

      const header = document.querySelector("header");
      if (!header || getComputedStyle(header).position !== "fixed") return;

      const headerBottom = header.getBoundingClientRect().bottom;
      const controlTop = control.getBoundingClientRect().top;
      if (headerBottom > 0 && controlTop < headerBottom) {
        window.scrollBy({ top: controlTop - headerBottom - 8, behavior: "instant" });
      }
    });
  }

  const maxDateOfBirth = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 14);
    return d.toISOString().split("T")[0];
  })();

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

    if (accountType === "student") {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();

      if (!formData.date_of_birth || Number.isNaN(dob.getTime()) || dob > today) {
        setError("Please enter a valid date of birth.");
        return;
      }

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
      }

      if (age < 14) {
        setError("You must be at least 14 years old to create an account.");
        return;
      }
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
            date_of_birth: formData.date_of_birth,
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
          "We sent a confirmation link to your email. Please click it to confirm your address — then you can log in."
        );
        setStep(3);
      } else if (accountType === "coach") {
        setSuccessMessage("Check your email to verify your address and activate your account.");
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
        <p className="text-[#5A6779] text-base md:text-lg">
          Set up your profile in under 5 minutes!
        </p>
      </section>

      {/* Progress Stepper */}
      <div className="flex items-start justify-center mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-start">
            <div
              className="flex flex-col items-center w-20"
              aria-current={step === i + 1 ? "step" : undefined}
            >
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
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            {ACCOUNT_CARDS.map((card) => (
              <button
                key={card.id}
                ref={(element) => { accountCardRefs.current[card.id] = element; }}
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

          <form onSubmit={handleSubmit} onFocusCapture={keepFocusedControlVisible} className="flex flex-col gap-5">
            <InputField
              label="Full Name"
              inputRef={fullNameRef}
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
                  showToggle={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
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
                  label="Date of Birth"
                  type="date"
                  name="date_of_birth"
                  required
                  max={maxDateOfBirth}
                  value={formData.date_of_birth}
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
                  showToggle={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
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
        <div
          ref={completionRef}
          tabIndex={-1}
          aria-labelledby="signup-completion-heading"
          aria-describedby="signup-completion-message"
          className="max-w-md mx-auto text-center py-8 flex flex-col items-center gap-5 outline-none"
        >
          <div className="w-16 h-16 bg-hsp-card rounded-full flex items-center justify-center text-3xl">
            ✉
          </div>
          <h2 id="signup-completion-heading" className="text-2xl font-bold text-hsp-dark">
            {accountType === "coach" ? "Account Submitted" : "Account Created!"}
          </h2>
          <p id="signup-completion-message" role="status" aria-live="polite" className="text-hsp-gray text-sm leading-relaxed">
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
