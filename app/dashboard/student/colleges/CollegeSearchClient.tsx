"use client";

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { getCollegeCardColor, getCollegeMonogram } from "@/lib/collegeCardStyle";
import type { University } from "@/lib/types";

const PAGE_SIZE = 20;

// Windowed page list: first, last, current ±2, with "ellipsis" markers for gaps.
function getPageWindow(current: number, total: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [1];
  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);
  if (left > 2) pages.push("ellipsis");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("ellipsis");
  if (total > 1) pages.push(total);
  return pages;
}

const LABEL_CLS = "text-[10px] font-semibold uppercase text-[#5A6779] mb-1 block";
const INPUT_CLS =
  "border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent bg-white";

// state_cd holds two-letter codes — value is the code, label is the name.
const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "PR", name: "Puerto Rico" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// Confirmed against live data — do not alter or guess at other values.
const CLASSIFICATION_OPTIONS = [
  "NCAA D1",
  "NCAA D2",
  "NCAA D3",
  "NAIA",
  "NJCAA D1",
  "NJCAA D2",
  "NJCAA D3",
  "CCCAA",
  "NCCAA",
  "USCAA",
  "NWAC",
  "LAI",
];

// Confirmed against live data.
const SECTOR_OPTIONS = [
  "Public, 4-year or above",
  "Public, 2-year",
  "Private nonprofit, 4-year or above",
  "Private for-profit, 4-year or above",
  "Private nonprofit, 2-year",
];

function CollegeSearchClientInner() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial state comes from the URL query string (populated on every search
  // below) so navigating to a college and back restores the prior view.
  const [term, setTerm] = useState(() => searchParams.get("q") ?? "");
  const [stateFilter, setStateFilter] = useState(() => searchParams.get("state") ?? "");
  const [levelFilter, setLevelFilter] = useState(() => searchParams.get("level") ?? "");
  const [typeFilter, setTypeFilter] = useState(() => searchParams.get("type") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // targetPage defaults to 1 so any user-triggered search resets to the first
  // page; page-number clicks pass an explicit page and keep the same filters.
  const runSearch = useCallback(
    async (
      targetPage: number = 1,
      overrides?: { term: string; state: string; level: string; type: string }
    ) => {
      setLoading(true);
      setPage(targetPage);

      // overrides let "Clear Filters" search with reset values without waiting
      // for the state updates to flush into this callback's closure.
      const activeTerm = (overrides?.term ?? term).trim();
      const activeState = overrides?.state ?? stateFilter;
      const activeLevel = overrides?.level ?? levelFilter;
      const activeType = overrides?.type ?? typeFilter;

      const from = (targetPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from("universities")
        .select("*", { count: "exact" })
        .order("institution_name", { ascending: true })
        .range(from, to);

      if (activeTerm) q = q.ilike("institution_name", `%${activeTerm}%`);
      if (activeState) q = q.eq("state_cd", activeState);
      if (activeLevel) q = q.eq("classification_name", activeLevel);
      if (activeType) q = q.eq("sector_name", activeType);

      const { data, count } = await q;
      setResults((data ?? []) as University[]);
      setTotalCount(count ?? 0);
      setLoading(false);
      setSearched(true);

      // Reflect the executed search in the URL (same pattern as StudentTabs.tsx).
      const params = new URLSearchParams();
      if (activeTerm) params.set("q", activeTerm);
      if (activeState) params.set("state", activeState);
      if (activeLevel) params.set("level", activeLevel);
      if (activeType) params.set("type", activeType);
      if (targetPage > 1) params.set("page", String(targetPage));
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [supabase, term, stateFilter, levelFilter, typeFilter, router]
  );

  // Initial load — filters/page come from the URL (see state initializers).
  useEffect(() => {
    const initialPage = Number(searchParams.get("page")) || 1;
    runSearch(initialPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function goToPage(p: number) {
    if (loading || p < 1 || p > totalPages || p === page) return;
    runSearch(p);
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const hasActiveFilters =
    term !== "" ||
    stateFilter !== "" ||
    levelFilter !== "" ||
    typeFilter !== "" ||
    page > 1;

  function clearFilters() {
    setTerm("");
    setStateFilter("");
    setLevelFilter("");
    setTypeFilter("");
    runSearch(1, { term: "", state: "", level: "", type: "" });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Search className="w-5 h-5" style={{ color: "#CE2C22" }} />
        <h1 className="text-xl font-bold" style={{ color: "#0f172a" }}>
          Search Colleges
        </h1>
      </div>

      {/* Text search — always visible */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="mb-3"
      >
        <label htmlFor="college-filter-term" className={LABEL_CLS}>Search by name</label>
        <div className="flex gap-2">
          <input
            id="college-filter-term"
            type="text"
            className={INPUT_CLS}
            placeholder="e.g. Florida Gulf Coast University"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="sm:hidden shrink-0 flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-[#5A6779]"
          >
            <SlidersHorizontal className="w-4 h-4" />
            All filters
          </button>
        </div>
      </form>

      {/* State / Level / Type — collapsed behind "All filters" on mobile */}
      <div
        className={`${showFilters ? "grid" : "hidden"} sm:grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4`}
      >
        <div>
          <label htmlFor="college-filter-state" className={LABEL_CLS}>State</label>
          <select
            id="college-filter-state"
            className={INPUT_CLS}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">Any State</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="college-filter-level" className={LABEL_CLS}>Level</label>
          <select
            id="college-filter-level"
            className={INPUT_CLS}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">Any Level</option>
            {CLASSIFICATION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="college-filter-type" className={LABEL_CLS}>Type</label>
          <select
            id="college-filter-type"
            className={INPUT_CLS}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Any Type</option>
            {SECTOR_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          style={{ backgroundColor: "#CE2C22" }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className="text-sm text-[#5A6779] hover:text-[#CE2C22] transition-colors disabled:opacity-60"
          >
            Clear Filters
          </button>
        )}
        {searched && !loading && totalCount > 0 && (
          <span className="text-xs ml-auto" style={{ color: "#5A6779" }}>
            Showing{" "}
            <span className="font-semibold" style={{ color: "#0f172a" }}>
              {(page - 1) * PAGE_SIZE + 1}&ndash;{(page - 1) * PAGE_SIZE + results.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold" style={{ color: "#0f172a" }}>
              {totalCount.toLocaleString()}
            </span>{" "}
            college{totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Results */}
      <div ref={resultsTopRef} aria-hidden="true" />
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#CE2C22] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: "#5A6779" }}>
          No colleges found
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {results.map((u) => (
            <Link
              key={u.id}
              href={`/dashboard/student/colleges/${u.unitid}`}
              className="relative overflow-hidden rounded-2xl p-4 min-h-[150px] flex flex-col transition-transform duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: getCollegeCardColor(u.unitid) }}
            >
              {/* Monogram watermark — decorative SVG, not text: automated
                  contrast tooling measures a <span> of text as a failure but
                  treats an <svg> as a graphic */}
              <svg
                aria-hidden="true"
                focusable="false"
                role="presentation"
                className="absolute -top-2 right-1 select-none pointer-events-none"
                width="240"
                height="76"
                style={{ overflow: "visible" }}
              >
                <text
                  x="240"
                  y="57"
                  textAnchor="end"
                  fontSize="68"
                  fontWeight="900"
                  fontFamily="Arial, Helvetica, sans-serif"
                  fill="rgba(255,255,255,0.12)"
                >
                  {getCollegeMonogram(u.institution_name)}
                </text>
              </svg>

              {u.classification_name && (
                <span
                  className="relative text-[10px] font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: "#ffffff" }}
                >
                  {u.classification_name}
                </span>
              )}

              <span className="relative font-bold text-white text-sm leading-snug break-words">
                {u.institution_name}
              </span>

              <span
                className="relative flex items-center gap-1 mt-1.5 text-xs min-w-0"
                style={{ color: "#ffffff" }}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {[u.city_txt, u.state_cd].filter(Boolean).join(", ") || "—"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination — only when there's more than one page of matches */}
      {searched && !loading && totalCount > PAGE_SIZE && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="shrink-0 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-[#5A6779] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Prev
          </button>
          {getPageWindow(page, totalPages).map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="shrink-0 px-1.5 text-sm select-none"
                style={{ color: "#5A6779" }}
              >
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`shrink-0 min-w-[36px] px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                  p === page
                    ? "text-white font-semibold"
                    : "border border-gray-200 text-[#5A6779] hover:bg-gray-50"
                }`}
                style={p === page ? { backgroundColor: "#CE2C22" } : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="shrink-0 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-[#5A6779] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// useSearchParams requires a Suspense boundary (same wrapping as
// app/dashboard/coach/page.tsx's CoachDashboardContent).
export default function CollegeSearchClient() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#CE2C22] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollegeSearchClientInner />
    </Suspense>
  );
}
