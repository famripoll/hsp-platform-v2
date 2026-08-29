"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { getCollegeCardColor, getCollegeMonogram } from "@/lib/collegeCardStyle";
import type { University } from "@/lib/types";
import CollegeMapSection from "./CollegeMapSection";

const formatUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

// Brand icons — lucide-react has no brand set, so these are copied verbatim
// (path data + colors) from app/dashboard/coach/student/[id]/page.tsx, trimmed
// to the three platforms the universities table carries and re-keyed to that
// table's own column names. X is forced white for contrast on the colored band.
const SOCIAL_PLATFORMS = [
  {
    name: "Facebook",
    key: "facebook_url" as const,
    color: "#1877F2",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    key: "instagram_url" as const,
    color: "#E1306C",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "X",
    key: "x_twitter_url" as const,
    color: "#ffffff",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
];

export default function CollegeHero({
  university,
  mapAddress,
}: {
  university: University;
  mapAddress: string;
}) {
  const [mapOpen, setMapOpen] = useState(false);

  const hasAddress = mapAddress.length > 0;
  const hasLocationRow = Boolean(university.city_txt || university.state_cd || hasAddress);
  const hasActionRow = Boolean(
    university.website_url || SOCIAL_PLATFORMS.some((p) => university[p.key])
  );

  return (
    <>
      {/* Hero band — deliberately breaks the white-card convention to tie back
          visually to the search grid card the student just clicked. */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6"
        style={{ backgroundColor: getCollegeCardColor(university.unitid) }}
      >
        <span
          aria-hidden="true"
          className="absolute -top-4 right-2 font-black leading-none select-none pointer-events-none"
          style={{ fontSize: "120px", color: "rgba(255,255,255,0.12)" }}
        >
          {getCollegeMonogram(university.institution_name)}
        </span>

        <div className="relative flex flex-col gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white break-words">
            {university.institution_name}
          </h1>

          {hasLocationRow && (
            <div>
              {hasAddress ? (
                <button
                  type="button"
                  onClick={() => setMapOpen((v) => !v)}
                  aria-expanded={mapOpen}
                  aria-label="View campus location on map"
                  className="flex items-center gap-1.5 text-sm py-1 hover:underline"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  {[university.city_txt, university.state_cd].filter(Boolean).join(", ") ||
                    "View on map"}
                </button>
              ) : (
                (university.city_txt || university.state_cd) && (
                  <span
                    className="flex items-center gap-1.5 text-sm"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    {[university.city_txt, university.state_cd].filter(Boolean).join(", ")}
                  </span>
                )
              )}
            </div>
          )}

          {(university.classification_name || university.sector_name) && (
            <div className="flex flex-wrap gap-2">
              {university.classification_name && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                >
                  {university.classification_name}
                </span>
              )}
              {university.sector_name && (
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                >
                  {university.sector_name}
                </span>
              )}
            </div>
          )}

          {hasActionRow && (
            <div className="flex flex-wrap items-center gap-3">
              {university.website_url && (
                <a
                  href={formatUrl(university.website_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold"
                  style={{ color: "#0f172a" }}
                >
                  Visit Website
                </a>
              )}
              {SOCIAL_PLATFORMS.filter((p) => university[p.key]).map((platform) => (
                <a
                  key={platform.name}
                  href={formatUrl(university[platform.key] as string)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.name}
                  style={{ color: platform.color }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d={platform.path} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wrapper (and its spacing) only exists while open — CollegeMapSection
          itself also renders null when collapsed. */}
      {hasAddress && mapOpen && (
        <div className="mb-6">
          <CollegeMapSection
            address={mapAddress}
            open={mapOpen}
            onToggle={() => setMapOpen((v) => !v)}
          />
        </div>
      )}
    </>
  );
}
