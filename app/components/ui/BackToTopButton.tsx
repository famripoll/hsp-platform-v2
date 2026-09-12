"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useActiveThread } from "@/app/hooks/useActiveThread";

const BACK_TO_TOP_THRESHOLD = 400; // px — scroll distance before the back-to-top button appears

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function useBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      setVisible(window.scrollY > BACK_TO_TOP_THRESHOLD);
    };

    const scheduleUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return visible;
}

export default function BackToTopButton() {
  const backToTopVisible = useBackToTop();
  const threadOpen = useActiveThread();
  const [focused, setFocused] = useState(false);

  // The button only overlaps the message thread's reply bar on mobile, so
  // the thread-open condition is applied to the base (mobile) classes only;
  // sm: and above ignore threadOpen. Focus keeps the button visible at every breakpoint.
  const visible = focused || (backToTopVisible && !threadOpen);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-hsp-red text-white shadow-lg transition-all duration-300 hover:opacity-90 ${
        visible
          ? "visible opacity-100 translate-y-0 pointer-events-auto"
          : "invisible opacity-0 translate-y-2 pointer-events-none"
      } ${
        focused || backToTopVisible
          ? "sm:visible sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto"
          : "sm:invisible sm:opacity-0 sm:translate-y-2 sm:pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
