"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-hsp-red text-white shadow-lg transition-all duration-300 hover:opacity-90 ${
        backToTopVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
