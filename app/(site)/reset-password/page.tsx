"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";

const INVALID_LINK_MSG = "This reset link is invalid or has expired.";
const SUCCESS_MSG = "Your password has been updated.";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    function markValid() {
      resolvedRef.current = true;
      setSessionValid(true);
      setCheckingSession(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        markValid();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        markValid();
      } else {
        setTimeout(() => {
          if (!resolvedRef.current) {
            setCheckingSession(false);
          }
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Reset</span>{" "}
          <span className="text-hsp-dark">Password</span>
        </h1>
        <p className="text-[#64748b] text-base md:text-lg">
          Choose a new password for your account
        </p>
      </section>

      {/* Form card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {checkingSession ? (
          <p className="text-sm text-hsp-gray text-center py-4">
            Verifying reset link...
          </p>
        ) : !sessionValid ? (
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="text-sm rounded-lg px-4 py-3 bg-red-50 w-full" style={{ color: "#d93025" }}>
              {INVALID_LINK_MSG}
            </p>
            <Link
              href="/forgot-password"
              className="text-hsp-dark font-semibold hover:text-hsp-red transition-colors duration-150 text-sm"
            >
              Request a new reset link
            </Link>
          </div>
        ) : success ? (
          <p className="text-sm rounded-lg px-4 py-3 bg-green-50 text-center" style={{ color: "#15803d" }}>
            {SUCCESS_MSG}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-semibold text-hsp-dark">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-hsp-card rounded-lg px-4 py-3 pr-12 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hsp-gray hover:text-hsp-dark transition-colors duration-150 text-xs font-semibold select-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-hsp-dark">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-hsp-card rounded-lg px-4 py-3 pr-12 text-sm text-hsp-dark placeholder:text-hsp-gray focus:outline-none focus:ring-2 focus:ring-hsp-red"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-hsp-gray hover:text-hsp-dark transition-colors duration-150 text-xs font-semibold select-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
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
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>
        )}
      </div>

      {/* Bottom links */}
      <div className="text-center mt-8 mb-6">
        <Link
          href="/login"
          className="text-hsp-dark font-semibold hover:text-hsp-red transition-colors duration-150 text-sm"
        >
          Back to Log In
        </Link>
      </div>
    </div>
  );
}
