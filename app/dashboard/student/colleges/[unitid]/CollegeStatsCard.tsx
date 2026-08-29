"use client";

import { useState } from "react";
import {
  Users,
  Percent,
  ClipboardList,
  DollarSign,
  GraduationCap,
  UserCheck,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import type { University } from "@/lib/types";

const fmtCurrency = (v: number | null | undefined) =>
  v == null
    ? null
    : v.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });

// Percent columns are stored on a 0–100 scale (e.g. 88.2 = 88.2%).
const fmtPct = (v: number | null | undefined) => (v == null ? null : `${v}%`);

// Matches the totalCount.toLocaleString() precedent in CollegeSearchClient.tsx.
const fmtCount = (v: number | null | undefined) => (v == null ? null : v.toLocaleString());

const fmtPlain = (v: number | null | undefined) => (v == null ? null : String(v));

type Row = { label: string; value: string | null; icon: LucideIcon };

function StatRow({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
        style={{ backgroundColor: "rgba(217, 48, 37, 0.1)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "#d93025" }} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs" style={{ color: "#64748b" }}>
          {label}
        </span>
        <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function Subsection({
  title,
  rows,
  first,
}: {
  title: string;
  rows: Row[];
  first: boolean;
}) {
  const visible = rows.filter((r): r is Row & { value: string } => r.value != null);
  if (visible.length === 0) return null;

  return (
    <div className={first ? "" : "border-t border-gray-100 pt-4 mt-4"}>
      <h3
        className="text-xs font-bold uppercase tracking-wide mb-4"
        style={{ color: "#d93025" }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
        {visible.map((r) => (
          <StatRow key={r.label} label={r.label} value={r.value} icon={r.icon} />
        ))}
      </div>
    </div>
  );
}

export default function CollegeStatsCard({ university }: { university: University }) {
  const [open, setOpen] = useState(false);

  const admissions: Row[] = [
    { label: "Admission Rate", value: fmtPct(university.admission_rate_pct), icon: Percent },
    { label: "SAT Total (mid)", value: fmtPlain(university.sat_total_mid), icon: ClipboardList },
    { label: "SAT Math (mid)", value: fmtPlain(university.sat_math_mid), icon: ClipboardList },
    { label: "SAT Reading (mid)", value: fmtPlain(university.sat_reading_mid), icon: ClipboardList },
    { label: "ACT Composite (mid)", value: fmtPlain(university.act_composite_mid), icon: ClipboardList },
  ];
  const cost: Row[] = [
    { label: "In-State Tuition", value: fmtCurrency(university.tuition_in_state_usd), icon: DollarSign },
    { label: "Out-of-State Tuition", value: fmtCurrency(university.tuition_out_state_usd), icon: DollarSign },
    { label: "Net Price", value: fmtCurrency(university.net_price_usd), icon: DollarSign },
    { label: "Avg Annual Cost", value: fmtCurrency(university.avg_annual_cost_usd), icon: DollarSign },
  ];
  const outcomes: Row[] = [
    { label: "Graduation Rate", value: fmtPct(university.grad_rate_pct), icon: GraduationCap },
    { label: "Retention Rate", value: fmtPct(university.retention_rate_pct), icon: UserCheck },
    { label: "Total Enrollment", value: fmtCount(university.enrollment_cnt), icon: Users },
  ];

  const sections: { title: string; rows: Row[] }[] = [
    { title: "Admissions & Testing", rows: admissions },
    { title: "Cost", rows: cost },
    { title: "Outcomes & Enrollment", rows: outcomes },
  ].filter((s) => s.rows.some((r) => r.value != null));

  if (sections.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col">
      {/* Mobile-only collapse toggle — mirrors CollapsibleContacts.tsx. Content
          below is forced visible at sm: and up regardless of `open`. */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="sm:hidden w-full flex items-center justify-between"
      >
        <span className="text-xs font-semibold uppercase" style={{ color: "#d93025" }}>
          View College Stats
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#d93025" }}
        />
      </button>

      <div className={`${open ? "flex mt-4" : "hidden"} sm:flex sm:mt-0 flex-col`}>
        {sections.map((s, i) => (
          <Subsection key={s.title} title={s.title} rows={s.rows} first={i === 0} />
        ))}
      </div>
    </div>
  );
}
