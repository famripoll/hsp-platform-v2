"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

const MAX_LENGTH = 2000;

type Props = {
  studentId: string;
  studentName: string;
};

export default function SendMessageCard({ studentId, studentName }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const trimmed = text.trim();
  const isDisabled = sending || trimmed.length === 0;

  async function handleSend() {
    if (isDisabled) return;

    setSending(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, body: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data?.error || "Failed to send message.");
        return;
      }

      setText("");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 w-full">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" style={{ color: "#d93025" }} />
        <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
          Send a Message
        </h3>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("idle");
        }}
        maxLength={MAX_LENGTH}
        rows={4}
        placeholder="Write your message..."
        aria-label={`Message to ${studentName}`}
        className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white resize-none"
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
        <span className="text-xs" style={{ color: "#64748b" }}>
          {text.length} / {MAX_LENGTH}
        </span>

        <button
          type="button"
          onClick={handleSend}
          disabled={isDisabled}
          className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#d93025" }}
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </div>

      {status === "success" && (
        <p className="text-sm mt-3" style={{ color: "#16a34a" }}>
          Message sent.
        </p>
      )}

      {status === "error" && (
        <p className="text-sm mt-3" style={{ color: "#dc2626" }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
