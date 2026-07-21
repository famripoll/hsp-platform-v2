"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";

export type TermsSectionRef = {
  id: string;
  number: number;
  title: string;
};

const TOP_OFFSET = 96; // px — clears the site's sticky header
const BOTTOM_GAP = 24; // px — breathing room before the sidebar's column ends

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useActiveSection(sections: TermsSectionRef[]) {
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
  | { type: "fixed"; left: number; width: number }
  | { type: "bottom" };

/**
 * The site's global layout (app/layout.tsx body overflow rules) breaks native
 * CSS position:sticky on pages taller than one viewport — reproducible on the
 * existing /privacy-policy page too, not introduced here. This hook manually
 * reproduces sticky-sidebar behavior with position:fixed, which isn't subject
 * to the same containing-block bug.
 */
function usePinnedSidebar() {
  const columnRef = useRef<HTMLElement>(null); // the placeholder <aside>, stretched to column height
  const panelRef = useRef<HTMLDivElement>(null); // the visible sidebar box
  const [mode, setMode] = useState<PinMode>({ type: "static" });

  useEffect(() => {
    const column = columnRef.current;
    const panel = panelRef.current;
    if (!column || !panel) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      if (window.innerWidth < 768) {
        setMode((prev) => (prev.type === "static" ? prev : { type: "static" }));
        return;
      }

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

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { columnRef, panelRef, mode };
}

export default function TermsTableOfContents({
  sections,
  effectiveDate,
  supportEmail,
}: {
  sections: TermsSectionRef[];
  effectiveDate: string;
  supportEmail: string;
}) {
  const activeId = useActiveSection(sections);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { columnRef, panelRef, mode } = usePinnedSidebar();

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

  return (
    <>
      {/* Mobile: collapsible "Jump to a Section" accordion */}
      <div className="md:hidden mb-8">
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
              Reach out to our team for any questions about these Terms.
            </p>
            <a href={`mailto:${supportEmail}`} className="text-hsp-red text-sm font-semibold hover:underline">
              {supportEmail}
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
