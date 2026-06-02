"use client";

import { useState } from "react";

const MAX_CHARS = 300;

const inputClass =
  "w-full bg-hsp-card text-hsp-dark placeholder:text-hsp-gray rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hsp-red";

export default function ContactForm() {
  const [message, setMessage] = useState("");

  return (
    <form className="flex flex-col gap-5" noValidate>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-hsp-dark" htmlFor="full-name">
          Full Name
        </label>
        <input
          id="full-name"
          type="text"
          placeholder="John Smith"
          className={inputClass}
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

      <button
        type="submit"
        className="w-full bg-hsp-red text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity duration-200 cursor-pointer"
      >
        Send Message →
      </button>

    </form>
  );
}
