import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import type { University } from "@/lib/types";
import { Users } from "lucide-react";
import CollegeHero from "./CollegeHero";
import BackToSearchLink from "./BackToSearchLink";

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

function StatCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string | null }[];
}) {
  const visible = rows.filter((r) => r.value != null);
  if (visible.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3
        className="text-xs font-bold uppercase tracking-wide mb-4"
        style={{ color: "#d93025" }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-2.5">
        {visible.map((r) => (
          <div key={r.label} className="flex justify-between gap-4">
            <span className="text-sm" style={{ color: "#64748b" }}>
              {r.label}
            </span>
            <span
              className="text-sm font-semibold text-right"
              style={{ color: "#0f172a" }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ unitid: string }>;
}) {
  const { unitid } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const isAllowedRole = profile?.role === "student" || profile?.role === "parent";
  if (!profile || !isAllowedRole || profile.status !== "active") {
    redirect("/login");
  }

  const { data: universityData } = await supabase
    .from("universities")
    .select("*")
    .eq("unitid", Number(unitid))
    .single();

  const university = universityData as University | null;

  if (!university) {
    redirect("/dashboard/student/colleges");
  }

  const mapAddress = [
    university.address_txt,
    university.city_txt,
    university.state_cd,
    university.zip_txt,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    // pb-24 keeps the last stat card clear of the floating BackToTopButton
    // (fixed bottom-6 right-6, h-12).
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 pb-24">
      <BackToSearchLink />

      {/* Hero band + collapsible map — a client component so the "View on map"
          link and the map's own toggle can share open state (this page is a
          Server Component and can't hold it). */}
      <CollegeHero university={university} mapAddress={mapAddress} />

      <div className="flex flex-col gap-6">
        {/* Coach contact — intentionally non-functional. Will be wired to a
            future program_staff table join once that data is uploaded. */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: "#d93025" }} />
            <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
              Baseball Program Contact
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users className="w-10 h-10" style={{ color: "#d1d5db" }} />
            <p className="text-sm text-center" style={{ color: "#64748b" }}>
              Coach information coming soon
            </p>
            <button
              type="button"
              disabled
              className="rounded-lg px-4 py-2 text-sm font-semibold cursor-not-allowed"
              style={{ backgroundColor: "#F2F3F3", color: "#64748b" }}
            >
              Contact Coach
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <StatCard
            title="Admissions & Testing"
            rows={[
              { label: "Admission Rate", value: fmtPct(university.admission_rate_pct) },
              { label: "SAT Total (mid)", value: fmtPlain(university.sat_total_mid) },
              { label: "SAT Math (mid)", value: fmtPlain(university.sat_math_mid) },
              { label: "SAT Reading (mid)", value: fmtPlain(university.sat_reading_mid) },
              { label: "ACT Composite (mid)", value: fmtPlain(university.act_composite_mid) },
            ]}
          />
          <StatCard
            title="Cost"
            rows={[
              { label: "In-State Tuition", value: fmtCurrency(university.tuition_in_state_usd) },
              { label: "Out-of-State Tuition", value: fmtCurrency(university.tuition_out_state_usd) },
              { label: "Net Price", value: fmtCurrency(university.net_price_usd) },
              { label: "Avg Annual Cost", value: fmtCurrency(university.avg_annual_cost_usd) },
            ]}
          />
          <StatCard
            title="Outcomes"
            rows={[
              { label: "Graduation Rate", value: fmtPct(university.grad_rate_pct) },
              { label: "Retention Rate", value: fmtPct(university.retention_rate_pct) },
            ]}
          />
          <StatCard
            title="Enrollment"
            rows={[
              { label: "Total Enrollment", value: fmtCount(university.enrollment_cnt) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
