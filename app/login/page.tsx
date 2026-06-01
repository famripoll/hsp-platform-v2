"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UNAUTHORIZED_MSG =
  "Your account is not authorized. Please contact your Parent/Guardian to select a payment plan.";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error === UNAUTHORIZED_MSG
            ? UNAUTHORIZED_MSG
            : "Invalid email or password"
        );
        return;
      }

      const dashboardMap: Record<string, string> = {
        student: "/dashboard/student",
        parent: "/dashboard/parent",
        coach: "/dashboard/coach",
      };

      router.push(dashboardMap[data.role] ?? "/");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
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
            className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

        </form>
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
