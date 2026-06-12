"use client";

import { useState } from "react";
import Link from "next/link";
import MediaUpload from "./MediaUpload";
import MediaGallery from "./MediaGallery";
import { Play, Lock, Search, Target, Bell } from "lucide-react";

type Student = {
  id: string;
  profile_id: string | null;
  email?: string | null;
  high_school?: string | null;
  city?: string | null;
  state?: string | null;
  grade?: string | null;
  gpa?: number | null;
  parent_email?: string | null;
  photo_url?: string | null;
  graduation_year?: string | null;
  primary_position?: string | null;
  secondary_position?: string | null;
  bats?: string | null;
  throws?: string | null;
  height?: string | null;
  weight?: string | null;
  phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  coach_name?: string | null;
  coach_email?: string | null;
  coach_phone?: string | null;
  stat_ab?: string | null;
  stat_h?: string | null;
  stat_2b?: string | null;
  stat_3b?: string | null;
  stat_r?: string | null;
  stat_avg?: string | null;
  stat_obp?: string | null;
  stat_slg?: string | null;
  stat_ops?: string | null;
  stat_rbi?: string | null;
  stat_hr?: string | null;
  stat_sb?: string | null;
  stat_fpd?: string | null;
  stat_era?: string | null;
  stat_whip?: string | null;
  stat_ip?: string | null;
  stat_k?: string | null;
  stat_bb?: string | null;
  stat_kbb?: string | null;
  stat_velo?: string | null;
  sat_score?: string | null;
  act_score?: string | null;
  intended_major?: string | null;
  subscription_status?: string | null;
};

const DASH = "—";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico",
];

const DIVISIONS = [
  "NCAA Division I",
  "NCAA Division II",
  "NCAA Division III",
  "NAIA",
  "NJCAA",
];

const TABS = [
  { label: "Overview", value: "overview" },
  { label: "Search Colleges", value: "search" },
  { label: "Your Target Schools", value: "target" },
  { label: "Notifications", value: "notifications" },
] as const;

type TabValue = typeof TABS[number]["value"];

const VALID_TABS: string[] = ["overview", "search", "target", "notifications"];

type Props = {
  student: Student;
  initialTab?: string;
  initialStatsTab?: string;
};

export default function StudentTabs({ student, initialTab = "overview", initialStatsTab = "position" }: Props) {
  const [activeSection, setActiveSection] = useState<TabValue>(
    VALID_TABS.includes(initialTab) ? (initialTab as TabValue) : "overview"
  );
  const [activeStatsTab, setActiveStatsTab] = useState(
    initialStatsTab === "pitcher" ? "pitcher" : "position"
  );

  return (
    <div className="md:col-span-2 flex flex-col gap-6">

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm">
        <nav className="flex flex-wrap justify-center px-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveSection(tab.value)}
              className={`shrink-0 px-4 py-4 text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
                activeSection === tab.value
                  ? "border-[#d93025] text-[#d93025] font-semibold"
                  : "border-transparent text-[#64748b] hover:text-[#d93025] hover:scale-105"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeSection === "overview" && (
        <>
          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-xs uppercase tracking-wide mb-0.5"
                  style={{ color: "#64748b" }}
                >
                  2026 Season
                </p>
                <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                  Stats
                </h3>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveStatsTab("position")}
                  className="px-3 py-2 transition-colors"
                  style={
                    activeStatsTab === "position"
                      ? { backgroundColor: "#0f172a", color: "#ffffff" }
                      : { backgroundColor: "#F2F3F3", color: "#0f172a" }
                  }
                >
                  Position Player
                </button>
                <button
                  onClick={() => setActiveStatsTab("pitcher")}
                  className="px-3 py-2 transition-colors"
                  style={
                    activeStatsTab === "pitcher"
                      ? { backgroundColor: "#0f172a", color: "#ffffff" }
                      : { backgroundColor: "#F2F3F3", color: "#0f172a" }
                  }
                >
                  Pitcher
                </button>
              </div>
            </div>

            {activeStatsTab === "position" ? (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {[
                  { label: "AB", value: student.stat_ab ?? DASH },
                  { label: "H", value: student.stat_h ?? DASH },
                  { label: "2B", value: student.stat_2b ?? DASH },
                  { label: "3B", value: student.stat_3b ?? DASH },
                  { label: "HR", value: student.stat_hr ?? DASH },
                  { label: "AVG", value: student.stat_avg ? parseFloat(student.stat_avg).toFixed(3).replace(/^0/, "") : DASH },
                  { label: "OBP", value: student.stat_obp ? parseFloat(student.stat_obp).toFixed(3).replace(/^0/, "") : DASH },
                  { label: "SLG", value: student.stat_slg ? parseFloat(student.stat_slg).toFixed(3).replace(/^0/, "") : DASH },
                  { label: "R", value: student.stat_r ?? DASH },
                  { label: "RBI", value: student.stat_rbi ?? DASH },
                  { label: "SB", value: student.stat_sb ?? DASH },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>
                      {s.value}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {[
                  { label: "ERA", value: student.stat_era ?? DASH },
                  { label: "WHIP", value: student.stat_whip ?? DASH },
                  { label: "IP", value: student.stat_ip ?? DASH },
                  { label: "K", value: student.stat_k ?? DASH },
                  { label: "BB", value: student.stat_bb ?? DASH },
                  { label: "K/BB", value: student.stat_kbb ?? DASH },
                  { label: "VELO mph", value: student.stat_velo ?? DASH },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>
                      {s.value}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5" style={{ color: "#d93025" }} />
              <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                Media
              </h3>
            </div>
            <MediaUpload subscriptionStatus={student.subscription_status ?? "free"} />
            <MediaGallery />
          </div>

          {/* Upgrade Banner — free users only */}
          {(student.subscription_status ?? "free") !== "paid" && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#F2F3F3" }}
                >
                  <Lock className="w-5 h-5" style={{ color: "#64748b" }} />
                </div>
                <p className="flex-1 text-sm font-medium" style={{ color: "#0f172a" }}>
                  Unlock full access — upgrade your plan to upload photos and videos.
                </p>
                <Link
                  href="/pricing"
                  className="shrink-0 text-sm font-semibold text-white rounded-xl px-6 py-3 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105"
                  style={{ backgroundColor: "#d93025" }}
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SEARCH COLLEGES TAB ── */}
      {activeSection === "search" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
            Search Colleges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className="text-sm font-medium mb-1 block"
                style={{ color: "#64748b" }}
              >
                State
              </label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent text-sm"
                style={{ color: "#0f172a" }}
                defaultValue=""
              >
                <option value="">All States</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="text-sm font-medium mb-1 block"
                style={{ color: "#64748b" }}
              >
                Level
              </label>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent text-sm"
                style={{ color: "#0f172a" }}
                defaultValue=""
              >
                <option value="">Level</option>
                {DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="text-sm font-semibold text-white rounded-xl px-4 py-2 mb-8 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: "#d93025" }}
          >
            Search
          </button>

          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Search className="w-10 h-10" style={{ color: "#d1d5db" }} />
            <p className="text-sm text-center" style={{ color: "#64748b" }}>
              Search results will appear here
            </p>
          </div>
        </div>
      )}

      {/* ── YOUR TARGET SCHOOLS TAB ── */}
      {activeSection === "target" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
            Your Target Schools
          </h3>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Target className="w-10 h-10" style={{ color: "#d1d5db" }} />
            <p className="text-sm text-center max-w-xs" style={{ color: "#64748b" }}>
              No target schools yet. Search colleges and save your favorites.
            </p>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeSection === "notifications" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-5" style={{ color: "#0f172a" }}>
            Notifications
          </h3>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell className="w-10 h-10" style={{ color: "#d1d5db" }} />
            <p className="text-sm text-center" style={{ color: "#64748b" }}>
              No notifications yet.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
