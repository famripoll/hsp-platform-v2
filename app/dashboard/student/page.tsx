import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "./LogOutButton";
import {
  User,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Pencil,
  Camera,
  Target,
  Sparkles,
  Play,
  Video,
} from "lucide-react";

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
  // Future columns not yet in DB schema
  graduation_year?: string | null;
  primary_position?: string | null;
  secondary_position?: string | null;
  bats?: string | null;
  throws?: string | null;
  height?: string | null;
  weight?: string | null;
  phone?: string | null;
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
  recruiting_goals?: string | null;
};

const DASH = "—";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student" || profile.status !== "active") {
    redirect("/login");
  }

  const { data: studentRaw } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  const student = (studentRaw ?? {}) as unknown as Student;

  const params = await searchParams;
  const activeTab = params.tab === "pitcher" ? "pitcher" : "position";

  return (
    <>
      {/* Dashboard Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-baseline gap-1 font-black text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:inline" style={{ color: "#0f172a" }}>
              {profile.full_name ?? ""}
            </span>
            <LogOutButton />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN: Player Profile Card ── */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">

              {/* Avatar + Name + Badges + Edit Profile */}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative shrink-0">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#0f172a" }}
                  >
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <button
                    className="absolute bottom-0 left-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: "#d93025" }}
                    aria-label="Upload photo"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <h2
                    className="text-2xl font-bold leading-tight text-right"
                    style={{ color: "#0f172a" }}
                  >
                    {profile.full_name ?? DASH}
                  </h2>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <GraduationCap
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: "#64748b" }}
                    />
                    <span className="text-sm truncate" style={{ color: "#64748b" }}>
                      {student.high_school ?? DASH}
                    </span>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <span
                      className="text-xs rounded-full px-3 py-1"
                      style={{ backgroundColor: "#F2F3F3", color: "#0f172a" }}
                    >
                      {student.graduation_year
                        ? `Class of ${student.graduation_year}`
                        : student.grade
                        ? `Grade ${student.grade}`
                        : DASH}
                    </span>
                  </div>

                  {/* Position Badges */}
                  <div className="flex flex-row gap-2 justify-end w-full mt-2">
                    <span
                      className="text-xs font-bold rounded px-2 py-1 text-white"
                      style={{ backgroundColor: "#d93025" }}
                    >
                      PRIMARY&nbsp;&nbsp;{student.primary_position ?? DASH}
                    </span>
                    <span
                      className="text-xs rounded px-2 py-1"
                      style={{ backgroundColor: "#F2F3F3", color: "#0f172a" }}
                    >
                      SECONDARY&nbsp;&nbsp;{student.secondary_position ?? DASH}
                    </span>
                  </div>

                  {/* Edit Profile */}
                  <Link href="/dashboard/student/edit" className="mt-3 block">
                    <button className="w-full flex items-center justify-center gap-2 border border-[#d93025] text-[#d93025] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#d93025] hover:text-white transition-colors">
                      <Pencil className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </Link>
                </div>
              </div>

              {/* Stats 2×2 Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {(
                  [
                    { label: "BATS", value: student.bats ?? DASH, icon: false },
                    { label: "THROWS", value: student.throws ?? DASH, icon: false },
                    {
                      label: "HT / WT",
                      value:
                        student.height && student.weight
                          ? `${student.height} / ${student.weight}`
                          : DASH,
                      icon: false,
                    },
                    {
                      label: "HOMETOWN",
                      value:
                        student.city && student.state
                          ? `${student.city}, ${student.state}`
                          : student.city ?? student.state ?? DASH,
                      icon: true,
                    },
                  ] as { label: string; value: string; icon: boolean }[]
                ).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl p-3"
                    style={{ backgroundColor: "#F2F3F3" }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: "#64748b" }}
                    >
                      {item.label}
                    </p>
                    <div className="flex items-start gap-1">
                      {item.icon && (
                        <MapPin
                          className="w-3 h-3 shrink-0 mt-0.5"
                          style={{ color: "#64748b" }}
                        />
                      )}
                      <span
                        className="text-sm font-semibold leading-tight"
                        style={{ color: "#0f172a" }}
                      >
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Sections */}
              <div className="flex flex-col gap-4">

                {/* Student */}
                <div className="border-t border-gray-100 pt-4">
                  <p
                    className="text-xs font-semibold uppercase mb-1.5"
                    style={{ color: "#d93025" }}
                  >
                    Student
                  </p>
                  <p className="text-sm font-bold mb-1" style={{ color: "#0f172a" }}>
                    {profile.full_name ?? DASH}
                  </p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{profile.email ?? DASH}</span>
                  </div>
                  {student.phone && (
                    <a
                      href={`tel:${student.phone}`}
                      className="flex items-center gap-2 text-sm mt-1 hover:opacity-80"
                      style={{ color: "#64748b" }}
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {student.phone}
                    </a>
                  )}
                </div>

                {/* Parent / Guardian */}
                <div className="border-t border-gray-100 pt-4">
                  <p
                    className="text-xs font-semibold uppercase mb-1.5"
                    style={{ color: "#d93025" }}
                  >
                    Parent / Guardian
                  </p>
                  <p className="text-sm font-bold mb-1" style={{ color: "#0f172a" }}>
                    {student.parent_name ?? DASH}
                  </p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{student.parent_email ?? DASH}</span>
                  </div>
                  {student.parent_phone && (
                    <a
                      href={`tel:${student.parent_phone}`}
                      className="flex items-center gap-2 text-sm mt-1 hover:opacity-80"
                      style={{ color: "#64748b" }}
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {student.parent_phone}
                    </a>
                  )}
                </div>

                {/* Coach */}
                <div className="border-t border-gray-100 pt-4">
                  <p
                    className="text-xs font-semibold uppercase mb-1.5"
                    style={{ color: "#d93025" }}
                  >
                    Coach
                  </p>
                  <p className="text-sm font-bold mb-1" style={{ color: "#0f172a" }}>
                    {student.coach_name ? `Coach ${student.coach_name}` : DASH}
                  </p>
                  {student.coach_email && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{student.coach_email}</span>
                    </div>
                  )}
                  {student.coach_phone && (
                    <a
                      href={`tel:${student.coach_phone}`}
                      className="flex items-center gap-2 text-sm mt-1 hover:opacity-80"
                      style={{ color: "#64748b" }}
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {student.coach_phone}
                    </a>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="md:col-span-2 flex flex-col gap-6">

            {/* CARD 2: Stats */}
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
                  <a
                    href="?tab=position"
                    className="px-3 py-2 transition-colors"
                    style={
                      activeTab === "position"
                        ? { backgroundColor: "#0f172a", color: "#ffffff" }
                        : { backgroundColor: "#F2F3F3", color: "#0f172a" }
                    }
                  >
                    Position Player
                  </a>
                  <a
                    href="?tab=pitcher"
                    className="px-3 py-2 transition-colors"
                    style={
                      activeTab === "pitcher"
                        ? { backgroundColor: "#0f172a", color: "#ffffff" }
                        : { backgroundColor: "#F2F3F3", color: "#0f172a" }
                    }
                  >
                    Pitcher
                  </a>
                </div>
              </div>

              {activeTab === "position" ? (
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

            {/* CARD 3: Academic Profile & Goals */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" style={{ color: "#d93025" }} />
                <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                  Academic Profile &amp; Goals
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { sub: "GPA", label: "Unweighted GPA", value: student.gpa?.toString() ?? DASH },
                  { sub: "SAT", label: "SAT Total Score", value: student.sat_score ?? DASH },
                  { sub: "ACT", label: "ACT Composite Score", value: student.act_score ?? DASH },
                ].map((item) => (
                  <div
                    key={item.sub}
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: "#F2F3F3" }}
                  >
                    <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>
                      {item.value}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p
                  className="text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color: "#64748b" }}
                >
                  Intended Major
                </p>
                <p className="text-lg font-semibold" style={{ color: "#0f172a" }}>
                  {student.intended_major ?? DASH}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#d93025" }} />
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: "#d93025" }}
                  >
                    My Recruiting Goals
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#0f172a" }}>
                  {student.recruiting_goals ?? DASH}
                </p>
              </div>
            </div>

            {/* CARD 4: Media */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5" style={{ color: "#d93025" }} />
                <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                  Media
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center">
                  <Camera className="w-8 h-8" style={{ color: "#d93025" }} />
                  <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Upload Photos
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    JPG, PNG up to 10MB
                  </p>
                </div>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center">
                  <Video className="w-8 h-8" style={{ color: "#d93025" }} />
                  <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                    Upload Videos
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    MP4 up to 500MB
                  </p>
                </div>
              </div>

              <button
                className="w-full bg-red-50 font-semibold rounded-xl py-3 transition-colors hover:bg-red-100"
                style={{ color: "#d93025" }}
              >
                View Media →
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
