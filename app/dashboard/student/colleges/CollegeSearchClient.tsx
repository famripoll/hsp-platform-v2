"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
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

const LABEL_CLS = "text-[10px] font-semibold uppercase text-[#64748b] mb-1 block";
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

export default function CollegeSearchClient() {
  const supabase = useMemo(() => createClient(), []);

  const [term, setTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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
    async (targetPage: number = 1) => {
      setLoading(true);
      setPage(targetPage);

      const from = (targetPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = supabase
        .from("universities")
        .select("*", { count: "exact" })
        .order("institution_name", { ascending: true })
        .range(from, to);

      const trimmed = term.trim();
      if (trimmed) q = q.ilike("institution_name", `%${trimmed}%`);
      if (stateFilter) q = q.eq("state_cd", stateFilter);
      if (levelFilter) q = q.eq("classification_name", levelFilter);
      if (typeFilter) q = q.eq("sector_name", typeFilter);

      const { data, count } = await q;
      setResults((data ?? []) as University[]);
      setTotalCount(count ?? 0);
      setLoading(false);
      setSearched(true);
    },
    [supabase, term, stateFilter, levelFilter, typeFilter]
  );

  // Initial load — ordered by name, no filters, first page.
  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function goToPage(p: number) {
    if (loading || p < 1 || p > totalPages || p === page) return;
    runSearch(p);
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Search className="w-5 h-5" style={{ color: "#d93025" }} />
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
        <label className={LABEL_CLS}>Search by name</label>
        <div className="flex gap-2">
          <input
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
            className="sm:hidden shrink-0 flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-[#64748b]"
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
          <label className={LABEL_CLS}>State</label>
          <select
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
          <label className={LABEL_CLS}>Level</label>
          <select
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
          <label className={LABEL_CLS}>Type</label>
          <select
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

      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          style={{ backgroundColor: "#d93025" }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
        {searched && !loading && totalCount > 0 && (
          <span className="text-xs" style={{ color: "#64748b" }}>
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
          <div className="w-8 h-8 border-4 border-[#d93025] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-center py-12" style={{ color: "#64748b" }}>
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
              {/* Monogram watermark */}
              <span
                aria-hidden="true"
                className="absolute -top-2 right-1 font-black leading-none select-none pointer-events-none"
                style={{ fontSize: "68px", color: "rgba(255,255,255,0.12)" }}
              >
                {getCollegeMonogram(u.institution_name)}
              </span>

              {u.classification_name && (
                <span
                  className="relative text-[10px] font-semibold uppercase tracking-wide mb-1.5"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {u.classification_name}
                </span>
              )}

              <span className="relative font-bold text-white text-sm leading-snug break-words">
                {u.institution_name}
              </span>

              <span
                className="relative flex items-center gap-1 mt-1.5 text-xs min-w-0"
                style={{ color: "rgba(255,255,255,0.8)" }}
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
            className="shrink-0 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-[#64748b] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Prev
          </button>
          {getPageWindow(page, totalPages).map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="shrink-0 px-1.5 text-sm select-none"
                style={{ color: "#64748b" }}
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
                    : "border border-gray-200 text-[#64748b] hover:bg-gray-50"
                }`}
                style={p === page ? { backgroundColor: "#d93025" } : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="shrink-0 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-[#64748b] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
