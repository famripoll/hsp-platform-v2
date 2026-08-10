"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";

const MAX_CHARS = 300;

const inputClass =
  "w-full bg-hsp-card text-hsp-dark placeholder:text-hsp-gray rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-hsp-red";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      execute: (widgetId?: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenResolveRef = useRef<((token: string) => void) | null>(null);

  useEffect(() => {
    if (status !== "success") return;

    let rafId2 = 0;
    const rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    return () => {
      cancelAnimationFrame(rafId1);
      cancelAnimationFrame(rafId2);
    };
  }, [status]);

  const renderTurnstile = () => {
    if (!window.turnstile || !turnstileContainerRef.current) return;
    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      size: "invisible",
      appearance: "execute",
      callback: (token: string) => {
        tokenResolveRef.current?.(token);
      },
      "error-callback": () => {
        tokenResolveRef.current?.("");
      },
      "expired-callback": () => {
        tokenResolveRef.current?.("");
      },
    });
  };

  const teardownTurnstile = () => {
    try {
      window.turnstile?.remove(widgetIdRef.current);
    } catch {
      // widget id may already be stale — nothing to clean up
    }
    widgetIdRef.current = undefined;
  };

  const getTurnstileToken = () => {
    return new Promise<string>((resolve) => {
      if (!window.turnstile) {
        resolve("");
        return;
      }
      if (!widgetIdRef.current) {
        renderTurnstile();
      }
      if (!widgetIdRef.current) {
        resolve("");
        return;
      }

      let settled = false;
      const settle = (token: string) => {
        if (settled) return;
        settled = true;
        tokenResolveRef.current = null;
        clearTimeout(timeoutId);
        resolve(token);
      };

      tokenResolveRef.current = settle;
      const timeoutId = setTimeout(() => settle(""), 15000);
      window.turnstile.execute(widgetIdRef.current);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const token = await getTurnstileToken();

      if (!token) {
        setErrorMessage("Verification failed. Please try again.");
        setStatus("error");
        teardownTurnstile();
        renderTurnstile();
        return;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          school,
          message,
          turnstileToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again later.");
        setStatus("error");
        teardownTurnstile();
        renderTurnstile();
        return;
      }

      setStatus("success");
      teardownTurnstile();
    } catch {
      setErrorMessage("Something went wrong. Please try again later.");
      setStatus("error");
      teardownTurnstile();
      renderTurnstile();
    }
  };

  const handleSendAnother = () => {
    setStatus("idle");
    setFullName("");
    setEmail("");
    setSchool("");
    setMessage("");
    setErrorMessage("");
  };

  if (status === "success") {
    return (
      <div className="flex flex-col gap-5 scroll-mt-20 sm:scroll-mt-24 w-full min-w-0">
        <p className="text-sm text-hsp-dark break-words">
          Thanks for reaching out! We&apos;ve received your message and someone from our team
          will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={handleSendAnother}
          className="w-full sm:w-auto self-start border border-hsp-red text-hsp-red py-3 px-6 rounded-xl font-semibold text-sm hover:bg-hsp-red hover:text-white transition-colors duration-200 cursor-pointer"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={renderTurnstile}
      />

      <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-hsp-dark" htmlFor="full-name">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            placeholder="John Smith"
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-hsp-dark" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="john@example.com"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-hsp-dark" htmlFor="school">
            School Name
          </label>
          <input
            id="school"
            type="text"
            placeholder="Lincoln High School"
            className={inputClass}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-hsp-dark" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Tell us how we can help..."
            value={message}
            maxLength={MAX_CHARS}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-hsp-gray text-right">
            {message.length} / {MAX_CHARS} characters
          </p>
        </div>

        <p className="text-xs text-hsp-gray">
          We use invisible Cloudflare Turnstile validation for your security.
        </p>

        <div ref={turnstileContainerRef} />

        {status === "error" && (
          <p className="text-xs text-hsp-red">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full bg-hsp-red text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Sending..." : "Send Message →"}
        </button>

      </form>
    </>
  );
}
