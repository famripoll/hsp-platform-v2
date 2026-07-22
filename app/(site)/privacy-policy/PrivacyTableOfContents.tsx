"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUp, ChevronDown } from "lucide-react";

export type PrivacySectionRef = {
  id: string;
  number: number;
  title: string;
};

const TOP_OFFSET = 96; // px — clears the site's sticky header (desktop, fixed h-16 header)
const BOTTOM_GAP = 24; // px — breathing room before the sidebar's column ends
const MOBILE_HEADER_GAP = 8; // px — breathing room below the measured mobile header height
const MOBILE_FALLBACK_HEADER_HEIGHT = 88; // px — used only until the header height can be measured
const BACK_TO_TOP_THRESHOLD = 400; // px — scroll distance before the back-to-top button appears

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

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

function useActiveSection(sections: PrivacySectionRef[]) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const visibleIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.current.add(entry.target.id);
          } else {
            visibleIds.current.delete(entry.target.id);
          }
        }

        const firstVisible = sections.find((section) => visibleIds.current.has(section.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      { rootMargin: "-112px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return activeId;
}

type PinMode =
  | { type: "static" }
  | { type: "fixed"; left: number; width: number; top?: number }
  | { type: "bottom" };

/**
 * The site's global layout (app/layout.tsx body overflow rules) breaks native
 * CSS position:sticky on pages taller than one viewport — reproducible on the
 * existing /terms-and-conditions page too, not introduced here. This hook manually
 * reproduces sticky behavior with position:fixed, which isn't subject to the
 * same containing-block bug. It drives both the desktop sidebar pin and,
 * below the md breakpoint, the mobile "Jump to a Section" accordion pin.
 */
function usePinnedSidebar() {
  const columnRef = useRef<HTMLElement>(null); // the placeholder <aside>, stretched to column height
  const panelRef = useRef<HTMLDivElement>(null); // the visible sidebar box
  const [mode, setMode] = useState<PinMode>({ type: "static" });

  const mobileColumnRef = useRef<HTMLDivElement>(null); // the placeholder wrapper for the mobile accordion
  const mobilePanelRef = useRef<HTMLDivElement>(null); // the visible accordion box
  const [mobileMode, setMobileMode] = useState<PinMode>({ type: "static" });
  const [mobileNaturalHeight, setMobileNaturalHeight] = useState<number>();

  useEffect(() => {
    const column = columnRef.current;
    const panel = panelRef.current;
    const mobileColumn = mobileColumnRef.current;
    const mobilePanel = mobilePanelRef.current;
    if (!column || !panel || !mobileColumn || !mobilePanel) return;

    let raf = 0;
    let mobileHeaderOffset = MOBILE_FALLBACK_HEADER_HEIGHT + MOBILE_HEADER_GAP;

    // Measures the real header height (it's two stacked rows on mobile, not a
    // fixed h-16 like desktop) and the accordion's collapsed height, so the
    // placeholder can hold its space once the panel is pinned.
    const measureMobile = () => {
      const header = document.querySelector("header");
      const headerHeight = header?.getBoundingClientRect().height ?? MOBILE_FALLBACK_HEADER_HEIGHT;
      mobileHeaderOffset = headerHeight + MOBILE_HEADER_GAP;
      setMobileNaturalHeight(mobilePanel.getBoundingClientRect().height);
    };

    const update = () => {
      raf = 0;

      if (window.innerWidth < 768) {
        setMode((prev) => (prev.type === "static" ? prev : { type: "static" }));

        const mobileColumnRect = mobileColumn.getBoundingClientRect();
        const docBottom = document.documentElement.scrollHeight;
        const viewportBottom = window.scrollY + window.innerHeight;
        const nearPageEnd = docBottom - viewportBottom < BOTTOM_GAP;

        if (mobileColumnRect.top > mobileHeaderOffset || nearPageEnd) {
          setMobileMode((prev) => (prev.type === "static" ? prev : { type: "static" }));
        } else {
          setMobileMode((prev) => {
            const next = {
              type: "fixed" as const,
              left: mobileColumnRect.left,
              width: mobileColumnRect.width,
              top: mobileHeaderOffset,
            };
            if (
              prev.type === "fixed" &&
              prev.left === next.left &&
              prev.width === next.width &&
              prev.top === next.top
            ) {
              return prev;
            }
            return next;
          });
        }
        return;
      }

      setMobileMode((prev) => (prev.type === "static" ? prev : { type: "static" }));

      const columnRect = column.getBoundingClientRect();
      const panelHeight = panel.offsetHeight;
      const bottomLimit = columnRect.bottom - BOTTOM_GAP;

      if (columnRect.top > TOP_OFFSET) {
        setMode((prev) => (prev.type === "static" ? prev : { type: "static" }));
      } else if (bottomLimit < TOP_OFFSET + panelHeight) {
        setMode((prev) => (prev.type === "bottom" ? prev : { type: "bottom" }));
      } else {
        setMode((prev) => {
          const next = { type: "fixed" as const, left: columnRect.left, width: columnRect.width };
          if (prev.type === "fixed" && prev.left === next.left && prev.width === next.width) return prev;
          return next;
        });
      }
    };

    const scheduleUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    const handleResize = () => {
      measureMobile();
      scheduleUpdate();
    };

    measureMobile();
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return {
    columnRef,
    panelRef,
    mode,
    mobileColumnRef,
    mobilePanelRef,
    mobileMode,
    mobileNaturalHeight,
  };
}

export default function PrivacyTableOfContents({
  sections,
  effectiveDate,
  supportEmail,
}: {
  sections: PrivacySectionRef[];
  effectiveDate: string;
  supportEmail: string;
}) {
  const activeId = useActiveSection(sections);
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    columnRef,
    panelRef,
    mode,
    mobileColumnRef,
    mobilePanelRef,
    mobileMode,
    mobileNaturalHeight,
  } = usePinnedSidebar();
  const backToTopVisible = useBackToTop();

  const handleSelect = (id: string) => {
    scrollToSection(id);
    setMobileOpen(false);
  };

  const panelStyle: CSSProperties =
    mode.type === "fixed"
      ? { position: "fixed", top: TOP_OFFSET, left: mode.left, width: mode.width }
      : mode.type === "bottom"
        ? { position: "absolute", bottom: 0, left: 0, width: "100%" }
        : { position: "static" };

  const mobilePanelStyle: CSSProperties =
    mobileMode.type === "fixed"
      ? { position: "fixed", top: mobileMode.top, left: mobileMode.left, width: mobileMode.width, zIndex: 30 }
      : { position: "static" };

  return (
    <>
      {/* Mobile: collapsible "Jump to a Section" accordion, pinned below the header while scrolling */}
      <div
        ref={mobileColumnRef}
        className="md:hidden mb-8"
        style={mobileMode.type === "fixed" && mobileNaturalHeight ? { minHeight: mobileNaturalHeight } : undefined}
      >
        <div ref={mobilePanelRef} style={mobilePanelStyle}>
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            className="w-full flex items-center justify-between bg-hsp-card rounded-xl px-4 py-3 text-sm font-semibold text-hsp-dark"
          >
            Jump to a Section
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {mobileOpen && (
            <nav className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <ul className="flex flex-col py-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelect(section.id);
                      }}
                      className={`block px-4 py-2 text-sm leading-snug transition-colors ${
                        activeId === section.id
                          ? "text-hsp-red font-semibold"
                          : "text-hsp-gray hover:text-hsp-dark"
                      }`}
                    >
                      {section.number}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Desktop: sidebar TOC, pinned in place via JS while scrolling */}
      <aside ref={columnRef} className="hidden md:block relative md:w-72 lg:w-80 shrink-0">
        <div ref={panelRef} style={panelStyle} className="flex flex-col gap-4">
          <nav className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
            <ul className="flex flex-col gap-0.5">
              {sections.map((section) => {
                const isActive = activeId === section.id;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(section.id);
                      }}
                      className={`block border-l-2 pl-3 pr-2 py-1.5 text-sm leading-snug transition-colors ${
                        isActive
                          ? "border-hsp-red text-hsp-red font-semibold"
                          : "border-transparent text-hsp-gray hover:text-hsp-dark hover:border-gray-300"
                      }`}
                    >
                      {section.number}. {section.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 bg-hsp-card rounded-xl px-4 py-4">
            <p className="text-sm font-semibold text-hsp-dark mb-1">Questions?</p>
            <p className="text-hsp-gray text-xs leading-relaxed mb-2">
              Reach out to our team for any questions about this Privacy Policy.
            </p>
            <a href={`mailto:${supportEmail}`} className="text-hsp-red text-sm font-semibold hover:underline">
              {supportEmail}
            </a>
          </div>
        </div>
      </aside>

      {/* Floating back-to-top button, visible at all breakpoints once scrolled down */}
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
    </>
  );
}
