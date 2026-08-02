"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Mail } from "lucide-react";

type Mode = "idle" | "editing";

const INPUT = "border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent text-sm";
const LABEL = "text-sm font-medium text-gray-600 mb-1 block";
const PRIMARY_BTN = "bg-[#d93025] text-white font-semibold rounded-xl px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-60 w-full sm:w-auto";
const SECONDARY_BTN = "border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-red-50 transition-colors disabled:opacity-60 w-full sm:w-auto";

export default function VerifyEmailBanner({ email }: { email: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState(email);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [updatedEmail, setUpdatedEmail] = useState<string | null>(null);

  async function handleResend() {
    setResending(true);
    setResendMessage(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 200 && data.status === "sent") {
        setResendMessage("Sent. Check your inbox.");
      } else if (res.status === 200 && data.status === "already_verified") {
        setResendMessage("Your email is already verified.");
      } else if (res.status === 429) {
        setResendMessage(data.error || "Please wait a moment before requesting another email.");
      } else {
        setResendMessage("Something went wrong. Please try again.");
      }
    } catch {
      setResendMessage("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 200) {
        setUpdatedEmail(data.email || emailInput);
        setTimeout(async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.push("/login");
        }, 2500);
      } else {
        setEditError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setEditError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setMode("idle");
    setEmailInput(email);
    setEditError(null);
  }

  if (updatedEmail) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-6">
        <p className="text-sm font-medium text-[#0f172a] break-words">
          Email updated. We sent a confirmation link to{" "}
          <span className="font-bold break-words">{updatedEmail}</span>. Please log in again to
          continue.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="bg-amber-100 rounded-xl p-2 shrink-0">
            <Mail size={18} className="text-amber-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0f172a]">Confirm your email address.</p>
            {mode === "idle" ? (
              <p className="text-sm text-[#64748b] mt-0.5 break-words">
                We sent a link to <span className="font-bold text-[#0f172a] break-words">{email}</span>.
                Click it to confirm we can reach you.
              </p>
            ) : (
              <p className="text-sm text-[#64748b] mt-0.5">
                Enter the correct email address below.
              </p>
            )}
          </div>
        </div>

        {mode === "idle" && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <button type="button" onClick={handleResend} disabled={resending} className={PRIMARY_BTN}>
              {resending ? "Sending..." : "Resend link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("editing");
                setResendMessage(null);
              }}
              className={SECONDARY_BTN}
            >
              Wrong email?
            </button>
          </div>
        )}
      </div>

      {mode === "idle" && resendMessage && (
        <p className="text-sm text-[#0f172a] mt-3">{resendMessage}</p>
      )}

      {mode === "editing" && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <label className={LABEL}>Email address</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={saving}
              className={INPUT}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            <button type="button" onClick={handleSave} disabled={saving} className={PRIMARY_BTN}>
              {saving ? "Saving..." : "Save and resend"}
            </button>
            <button type="button" onClick={handleCancel} disabled={saving} className={SECONDARY_BTN}>
              Cancel
            </button>
          </div>
          {editError && (
            <p className="text-sm text-red-600 w-full">{editError}</p>
          )}
        </div>
      )}
    </div>
  );
}
