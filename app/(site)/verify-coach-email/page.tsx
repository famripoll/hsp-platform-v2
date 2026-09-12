"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "loading" | "success" | "already" | "expired" | "invalid" | "error";

function LoginButton() {
  return (
    <Link
      href="/login"
      className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 hover:scale-105 transition-transform duration-200 text-center"
    >
      Go to Login
    </Link>
  );
}

function VerifyCoachEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch("/api/auth/verify-coach-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          data?.status === "success" ||
          data?.status === "already" ||
          data?.status === "expired" ||
          data?.status === "invalid"
        ) {
          setStatus(data.status);
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Verify</span>{" "}
          <span className="text-hsp-dark">Your Email</span>
        </h1>
      </section>

      {/* Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div role="status" aria-live="polite" className="contents">
          {status === "loading" && (
            <p className="text-sm text-hsp-gray text-center py-4">
              Verifying your email...
            </p>
          )}

          {status === "success" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <h2 className="text-xl font-bold text-hsp-dark">Email verified</h2>
              <p className="text-sm text-hsp-gray">
                You can now sign in to your coach account.
              </p>
              <LoginButton />
            </div>
          )}

          {status === "already" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <h2 className="text-xl font-bold text-hsp-dark">Already verified</h2>
              <p className="text-sm text-hsp-gray">
                This email address has already been verified.
              </p>
              <LoginButton />
            </div>
          )}
        </div>

        <div role="alert" aria-live="assertive" className="contents">
          {status === "expired" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <h2 className="text-xl font-bold text-hsp-dark">Link expired</h2>
              <p className="text-sm text-hsp-gray">
                This link has expired. Please contact
                support@highschoolprospect.com for a new one.
              </p>
              <LoginButton />
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <h2 className="text-xl font-bold text-hsp-dark">Invalid link</h2>
              <p className="text-sm text-hsp-gray">This link is not valid.</p>
              <LoginButton />
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-5 items-center text-center">
              <h2 className="text-xl font-bold text-hsp-dark">
                Something went wrong
              </h2>
              <p className="text-sm text-hsp-gray">Please try again later.</p>
              <LoginButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyCoachEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mt-10">
          <p role="status" aria-live="polite" className="text-sm text-hsp-gray text-center py-4">
            Verifying your email...
          </p>
        </div>
      }
    >
      <VerifyCoachEmailContent />
    </Suspense>
  );
}
