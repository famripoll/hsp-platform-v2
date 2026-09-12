"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "submitting" | "done" | "error";

// The only interactive piece of the unsubscribe page. It receives nothing but
// the opaque token string — never any recipient row, never the email address.
export default function UnsubscribeButton({ token }: { token: string }) {
  const [state, setState] = useState<State>("idle");
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state === "done") {
      successRef.current?.focus();
    }
  }, [state]);

  async function confirm() {
    setState("submitting");
    try {
      const res = await fetch("/api/college-contacts/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setState(data?.status === "success" ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex flex-col gap-4 items-center text-center">
        <h2
          ref={successRef}
          tabIndex={-1}
          className="text-xl font-bold text-hsp-dark focus:outline-2 focus:outline-offset-4 focus:outline-hsp-red"
        >
          You&apos;ve been unsubscribed
        </h2>
        <p className="text-sm text-hsp-gray">
          You will not receive any further messages from High School Prospect
          student athletes. You can close this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center text-center">
      <p className="text-sm text-hsp-gray">
        Please confirm that you no longer want to receive messages from High
        School Prospect student athletes.
      </p>
      <button
        type="button"
        onClick={confirm}
        disabled={state === "submitting"}
        className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-center"
      >
        {state === "submitting" ? "Unsubscribing…" : "Unsubscribe me"}
      </button>
      {state === "error" && (
        <p className="text-sm text-hsp-red">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
