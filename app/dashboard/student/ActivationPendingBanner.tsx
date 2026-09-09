"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Clock } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

export default function ActivationPendingBanner() {
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function stopPolling() {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    async function checkStatus() {
      try {
        const res = await fetch("/api/subscription/status");
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (data.status === "paid") {
          stopPolling();
          if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          window.location.reload();
        }
      } catch {
        // Transient network errors are ignored; the next poll will retry.
      }
    }

    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);

    return () => {
      stopPolling();
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex items-start gap-3 min-w-0">
        <div className="bg-red-100 rounded-xl p-2 shrink-0">
          {timedOut ? (
            <Clock size={18} className="text-[#d93025]" />
          ) : (
            <Loader2 size={18} className="text-[#d93025] animate-spin" />
          )}
        </div>
        <div className="min-w-0">
          {timedOut ? (
            <>
              <p className="text-sm font-semibold text-[#0f172a]">
                Activation is taking longer than usual
              </p>
              <p className="text-sm text-[#5A6779] mt-0.5 break-words">
                Your payment was received. Activation is taking longer than usual — please
                refresh the page in a moment. If it persists, contact{" "}
                <a
                  href="mailto:support@highschoolprospect.com"
                  className="font-semibold text-[#d93025] break-words"
                >
                  support@highschoolprospect.com
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#0f172a]">
                Activating your subscription
              </p>
              <p className="text-sm text-[#5A6779] mt-0.5 break-words">
                Your payment was received. This usually takes just a few seconds.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
