"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

const SUCCESS_MSG =
  "If an account exists with that email, you'll receive a password reset link shortly.";
const ERROR_MSG = "Something went wrong. Please try again later.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();

      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_APP_URL + "/reset-password",
      });

      setMessage(SUCCESS_MSG);
    } catch {
      setError(ERROR_MSG);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Forgot</span>{" "}
          <span className="text-hsp-dark">Password</span>
        </h1>
        <p className="text-[#64748b] text-base md:text-lg">
          Enter your email to reset your password
        </p>
      </section>

      {/* Form card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

          {message && (
            <p className="text-sm rounded-lg px-4 py-3 bg-green-50" style={{ color: "#15803d" }}>
              {message}
            </p>
          )}

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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>
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
