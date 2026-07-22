"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import LogOutButton from "@/app/dashboard/student/LogOutButton";
import SettingsLink from "@/app/dashboard/student/SettingsLink";

/**
 * Same pattern as app/components/layout/Header.tsx's useHeaderHeight: the nav
 * is always position:fixed (no scroll-based toggle — that caused a one-time
 * visible jump in an earlier fix), so this hook measures its real height for
 * a spacer to hold that space in the document flow.
 */
function useNavHeight() {
  const navRef = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const measure = () => {
      setHeight(nav.getBoundingClientRect().height);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { navRef, height };
}

export default function DashboardNav() {
  const pathname = usePathname();
  const isCoach = pathname.startsWith("/dashboard/coach");
  const isSettingsActive = pathname.endsWith("/settings");
  const { navRef, height } = useNavHeight();

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between min-w-0">
          <Link
            href={isCoach ? "/dashboard/coach" : "/dashboard/student"}
            className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isCoach ? (
              <Link
                href="/dashboard/coach/settings"
                className={`flex items-center gap-1 text-sm transition-colors ${
                  isSettingsActive ? "text-[#d93025]" : "text-[#0f172a] hover:text-[#d93025]"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            ) : (
              <SettingsLink />
            )}
            <LogOutButton />
          </div>
        </div>
      </nav>

      {/* Spacer — holds the nav's height in the document flow, since the nav is always position:fixed.
          shrink-0 is required: dashboard/layout.tsx's wrapper can exceed 100vh, and without it the
          flexbox shrink algorithm would crush this empty div to 0px regardless of its inline height
          (the exact bug already fixed on the public Header.tsx). */}
      <div className="shrink-0" style={{ height }} aria-hidden="true" />
    </>
  );
}
