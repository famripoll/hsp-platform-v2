"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";

const MAX_CHARS = 300;

const inputClass =
  "w-full bg-hsp-card text-hsp-dark placeholder:text-hsp-gray rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hsp-red";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId?: string) => void;
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
  const tokenRef = useRef("");
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.scrollIntoView({ block: "start" });
    }
  }, [status]);

  const renderTurnstile = () => {
    if (!window.turnstile || !turnstileContainerRef.current) return;
    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      size: "invisible",
      callback: (token: string) => {
        tokenRef.current = token;
      },
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const token = tokenRef.current || window.turnstile?.getResponse(widgetIdRef.current) || "";

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
        window.turnstile?.reset(widgetIdRef.current);
        tokenRef.current = "";
        setErrorMessage(data.error || "Something went wrong. Please try again later.");
        setStatus("error");
        return;
      }

      window.turnstile?.reset(widgetIdRef.current);
      tokenRef.current = "";
      setStatus("success");
    } catch {
      window.turnstile?.reset(widgetIdRef.current);
      tokenRef.current = "";
      setErrorMessage("Something went wrong. Please try again later.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        ref={successRef}
        className="flex flex-col gap-5 scroll-mt-20 sm:scroll-mt-24 w-full min-w-0"
      >
        <p className="text-sm text-hsp-dark break-words">
          Thanks for reaching out! We&apos;ve received your message and someone from our team
          will get back to you shortly.
        </p>
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
