"use client";

import { useState } from "react";

type StatsStudent = {
  primary_position?: string | null;
  secondary_position?: string | null;
  stat_ab?: string | null;
  stat_h?: string | null;
  stat_2b?: string | null;
  stat_3b?: string | null;
  stat_r?: string | null;
  stat_avg?: string | null;
  stat_obp?: string | null;
  stat_slg?: string | null;
  stat_rbi?: string | null;
  stat_hr?: string | null;
  stat_sb?: string | null;
  stat_era?: string | null;
  stat_whip?: string | null;
  stat_ip?: string | null;
  stat_k?: string | null;
  stat_bb?: string | null;
  stat_kbb?: string | null;
  stat_velo?: string | null;
};

const DASH = "—";

export default function StatsToggleCard({ student }: { student: StatsStudent }) {
  const isPitcher = student.primary_position === "P" || student.secondary_position === "P";
  const [activeStatsTab, setActiveStatsTab] = useState<"position" | "pitcher">(isPitcher ? "pitcher" : "position");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
          Stats
        </h3>
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
  );
}
