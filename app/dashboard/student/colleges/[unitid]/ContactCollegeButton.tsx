"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type StatusResponse = {
  hasActiveSubscription: boolean;
  plan: string | null;
  limit: number;
  used: number;
  remaining: number;
  cycleStart: string | null;
  nextResetAt: string | null;
  hasPhoto: boolean;
  hasVideo: boolean;
};

type Props = {
  unitid: number;
  institutionName: string;
  hasCoaches: boolean;
  isParentViewer: boolean;
};

const PLACEHOLDER = `Tell the coach why you're interested in their program specifically, and anything your stats don't show. Example: "I've followed your program since watching the 2025 regional. I'm a left-handed pitcher looking to study engineering, and I know you have both. I threw 84 mph this spring and I'm working to add velocity before my senior season."`;

export default function ContactCollegeButton({
  unitid,
  institutionName,
  hasCoaches,
  isParentViewer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Mirrors `sending` so the document keydown listener, which is bound once
  // per open, sees the current value instead of the one from when it opened.
  const sendingRef = useRef(false);
  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  async function loadStatus() {
    setLoading(true);
    setLoadError("");
    setStatusData(null);
    try {
      const res = await fetch("/api/college-contacts/status");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data?.error || "Something went wrong.");
        return;
      }
      setStatusData(data as StatusResponse);
    } catch {
      setLoadError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    setText("");
    setStatus("idle");
    setErrorMessage("");
    loadStatus();
  }

  function handleClose() {
    if (sendingRef.current) return;
    setOpen(false);
    setText("");
    setStatus("idle");
    setErrorMessage("");
    setStatusData(null);
    setLoadError("");
    triggerRef.current?.focus();
  }

  const focusableSelector =
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Moves focus into the dialog on open, and again whenever a state change
  // leaves focus outside it or on an element that is no longer focusable
  // (the Send button once disabled or unmounted).
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector);
    const active = document.activeElement;
    if (!active || !dialog.contains(active) || !active.matches(focusableSelector)) {
      focusable[0]?.focus();
    }
  }, [open, status, sending]);

  const trimmed = text.trim();
  const isDisabled = sending || trimmed.length === 0;

  async function handleSend() {
    if (isDisabled) return;

    setSending(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/college-contacts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitid, body: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error || "Failed to send message.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function renderStateBlock() {
    if (!statusData) return null;

    const { hasActiveSubscription, hasPhoto, hasVideo, limit, remaining, nextResetAt } =
      statusData;

    if (isParentViewer) {
      return (
        <p className="text-sm" style={{ color: "#5A6779" }}>
          Only the student can send college contacts. {remaining} of {limit} contacts
          remaining this month.
        </p>
      );
    }

    if (!hasActiveSubscription) {
      return (
        <p className="text-sm" style={{ color: "#5A6779" }}>
          An active subscription is required to contact colleges.
        </p>
      );
    }

    if (!hasPhoto || !hasVideo) {
      return (
        <p className="text-sm" style={{ color: "#5A6779" }}>
          Upload at least one photo and one video to your profile before contacting a
          college.
        </p>
      );
    }

    if (remaining === 0) {
      const resetDate = nextResetAt
        ? new Date(nextResetAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : null;
      return (
        <p className="text-sm" style={{ color: "#5A6779" }}>
          You have used all {limit} contacts this month.
          {resetDate ? ` They reset on ${resetDate}.` : ""}
        </p>
      );
    }

    return (
      <div>
        <p className="text-sm mb-3" style={{ color: "#0f172a" }}>
          {remaining} of {limit} contacts remaining this month.
        </p>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("idle");
          }}
          maxLength={500}
          readOnly={sending}
          rows={6}
          placeholder={PLACEHOLDER}
          aria-label={`Message to the baseball coaching staff at ${institutionName}`}
          className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white resize-none"
        />

        <p className="text-xs mt-1.5" style={{ color: "#5A6779" }}>
          {text.length} / 500
        </p>

        <ul
          className="text-xs mt-2 space-y-1 list-disc pl-5"
          style={{ color: "#5A6779" }}
        >
          <li>Don&apos;t repeat your stats.</li>
          <li>Don&apos;t send the same message to every school.</li>
          <li>Don&apos;t include a phone number or email address.</li>
        </ul>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSend}
            disabled={isDisabled}
            className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#CE2C22" }}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>

        <p
          role="alert"
          aria-live="assertive"
          className={`text-sm ${status === "error" ? "mt-3" : ""}`}
          style={{ color: "#dc2626" }}
        >
          {status === "error" ? errorMessage : ""}
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#CE2C22" }}
      >
        {hasCoaches ? "Contact Coach" : "Contact College"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2
                id="contact-modal-title"
                className="text-xl font-bold"
                style={{ color: "#0f172a" }}
              >
                {institutionName}
              </h2>
              <button
                onClick={handleClose}
                disabled={sending}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: "#0f172a" }} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto">
              {status === "success" ? (
                <div>
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-sm"
                    style={{ color: "#0f172a" }}
                  >
                    Message sent to {institutionName}. You&apos;ll find this conversation
                    under College Contacts in Messages.
                  </p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-200"
                      style={{ backgroundColor: "#CE2C22" }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <p className="text-sm" style={{ color: "#5A6779" }}>
                  Loading…
                </p>
              ) : loadError ? null : (
                <div className="space-y-4">
                  {/* Block 1 — recipients line */}
                  <p className="text-sm" style={{ color: "#5A6779" }}>
                    {hasCoaches
                      ? `This message will be sent to the baseball coaching staff at ${institutionName}.`
                      : "We'll route your message to this college's baseball program."}
                  </p>

                  {/* Block 2 — what is sent automatically */}
                  <p className="text-sm" style={{ color: "#5A6779" }}>
                    The coach will automatically receive your name, graduation year,
                    position, high school, height and weight, GPA, and a link to your
                    profile with photos and video. There&apos;s no need to repeat any of
                    those details in your message.
                  </p>

                  {/* Block 3 — state-specific: form or notice */}
                  {renderStateBlock()}
                </div>
              )}

              <p
                role="alert"
                aria-live="assertive"
                className="text-sm"
                style={{ color: "#dc2626" }}
              >
                {loadError ? loadError : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
