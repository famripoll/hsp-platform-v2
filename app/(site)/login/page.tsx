"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

const UNAUTHORIZED_MSG =
  "Your account is not authorized. Please contact your Parent/Guardian to select a payment plan.";
const COACH_PENDING_MSG =
  "Your coach account is pending manual verification. You will receive an email once your account is activated and you can access the coach dashboard.";
const NO_ACCOUNT_MSG = "No account found with that email address.";
const OTP_ERROR_MSG = "Invalid or expired code. Please try again.";
const RESEND_DELAY_MS = 30000;

type Phase = "email" | "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTick, setResendTick] = useState(0);

  useEffect(() => {
    if (phase !== "otp") return;
    setCanResend(false);
    const timer = setTimeout(() => setCanResend(true), RESEND_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, resendTick]);

  function handleChangeEmail() {
    setPhase("email");
    setPassword("");
    setOtp("");
    setError(null);
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: rpcError } = await supabase.rpc("get_role_by_email", {
        lookup_email: email,
      });

      if (rpcError || !data) {
        setError(NO_ACCOUNT_MSG);
        return;
      }

      if (data === "parent") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: false, emailRedirectTo: undefined },
        });

        if (otpError) {
          setError(OTP_ERROR_MSG);
          return;
        }

        setPhase("otp");
        return;
      }

      setPhase("password");
    } catch {
      setError(NO_ACCOUNT_MSG);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError("Invalid email or password");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        setError("Invalid email or password");
        return;
      }

      if (profile.role === "coach") {
        const { data: coachRow } = await supabase
          .from("coaches")
          .select("verified")
          .eq("profile_id", authData.user.id)
          .single();

        if (!coachRow?.verified) {
          setError(COACH_PENDING_MSG);
          return;
        }

        router.push("/dashboard/coach");
        return;
      }

      if (profile.status === "pending" || profile.status === "expired") {
        setError(UNAUTHORIZED_MSG);
        return;
      }

      if (profile.role === "parent") {
        const { data: parentRow } = await supabase
          .from("parents")
          .select("student_id")
          .eq("profile_id", authData.user.id)
          .single();

        if (!parentRow) {
          setError("No linked student found for this parent account.");
          return;
        }

        localStorage.setItem("viewerRole", "parent");
        router.push("/dashboard/student");
        return;
      }

      if (profile.role === "student") {
        localStorage.setItem("viewerRole", "student");
      }

      const dashboardMap: Record<string, string> = {
        student: "/dashboard/student",
        coach: "/dashboard/coach",
      };

      router.push(dashboardMap[profile.role] ?? "/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (verifyError || !verifyData.user) {
        setError(OTP_ERROR_MSG);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", verifyData.user.id)
        .single();

      if (profileError || !profile) {
        setError(OTP_ERROR_MSG);
        return;
      }

      if (profile.status === "pending" || profile.status === "expired") {
        setError(UNAUTHORIZED_MSG);
        return;
      }

      localStorage.setItem("viewerRole", "parent");
      router.push("/dashboard/student");
    } catch {
      setError(OTP_ERROR_MSG);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setCanResend(false);
    setResendTick((t) => t + 1);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false, emailRedirectTo: undefined },
      });

      if (otpError) {
        setError(OTP_ERROR_MSG);
      }
    } catch {
      setError(OTP_ERROR_MSG);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Welcome</span>{" "}
          <span className="text-hsp-dark">Back</span>
        </h1>
        <p className="text-[#64748b] text-base md:text-lg">
          Log in to your HSP account
        </p>
      </section>

      {/* Form card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

        {phase === "email" && (
          <form onSubmit={handleContinue} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-hsp-dark">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-hsp-card rounded-lg px-4 py-3 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-4 py-3 bg-red-50" style={{ color: "#d93025" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}

        {phase === "password" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-hsp-dark">
                Email Address
              </label>
              <div className="flex items-center justify-between bg-hsp-card rounded-lg px-4 py-3">
                <span className="text-sm text-hsp-gray">{email}</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs text-hsp-red font-medium hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-hsp-dark">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-hsp-card rounded-lg px-4 py-3 pr-12 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hsp-gray hover:text-hsp-dark transition-colors duration-150 text-xs font-semibold select-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right -mt-2">
              <Link
                href="/forgot-password"
                className="text-xs text-hsp-red font-medium hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {error && (
              <p className="text-sm rounded-lg px-4 py-3 bg-red-50" style={{ color: "#d93025" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {phase === "otp" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
            {/* Email (read-only) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-hsp-dark">
                Email Address
              </label>
              <div className="flex items-center justify-between bg-hsp-card rounded-lg px-4 py-3">
                <span className="text-sm text-hsp-gray">{email}</span>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs text-hsp-red font-medium hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            <p className="text-sm text-hsp-gray">
              We sent a 6-digit code to your email. Please check your inbox.
            </p>

            {/* OTP */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-sm font-semibold text-hsp-dark">
                6-Digit Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="bg-hsp-card rounded-lg px-4 py-3 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red tracking-widest"
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-4 py-3 bg-red-50" style={{ color: "#d93025" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 hover:scale-105 transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="text-center -mt-2">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-xs text-hsp-red font-medium hover:underline"
                >
                  Resend Code
                </button>
              ) : (
                <span className="text-xs text-hsp-gray">Resend Code available shortly</span>
              )}
            </div>
          </form>
        )}

      </div>

      {/* Bottom links */}
      <div className="text-center mt-8 mb-6 flex flex-col gap-3">
        <p className="text-hsp-gray text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-hsp-dark font-semibold hover:text-hsp-red transition-colors duration-150"
          >
            Sign Up
          </Link>
        </p>
        <p className="text-hsp-gray text-xs">
          By logging in, you agree to our{" "}
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
      </div>
    </div>
  );
}
