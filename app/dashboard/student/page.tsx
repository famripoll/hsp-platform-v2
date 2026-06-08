import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "./LogOutButton";
import MediaUpload from "./MediaUpload";
import MediaGallery from "./MediaGallery";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import {
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Pencil,
  Target,
  Sparkles,
  Play,
  Settings,
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
  photo_url?: string | null;
  // Future columns not yet in DB schema
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
  recruiting_goals?: string | null;
  subscription_status?: string | null;
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
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/student/settings"
              className="flex items-center gap-1 text-sm text-[#0f172a] hover:text-[#d93025] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
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
                <ProfilePhotoUpload initialPhotoUrl={student.photo_url ?? null} />

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

                  {/* Positions */}
                  <div className="flex justify-end mt-2">
                    <span className="text-sm" style={{ color: "#64748b" }}>
                      <span className="font-semibold" style={{ color: "#d93025" }}>Position:&nbsp;</span>
                      <span style={{ color: "#0f172a" }}>
                        {student.primary_position
                          ? student.secondary_position
                            ? `${student.primary_position}, ${student.secondary_position}`
                            : student.primary_position
                          : DASH}
                      </span>
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
                  {(student.facebook_url || student.instagram_url) && (
                    <div className="flex items-center gap-3 mt-2">
                      {student.facebook_url && (
                        <a
                          href={student.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                          className="text-[#64748b] hover:text-[#d93025] transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      )}
                      {student.instagram_url && (
                        <a
                          href={student.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="text-[#64748b] hover:text-[#d93025] transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                    </div>
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

            {/* CARD 3: Media */}
            <div className="relative bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5" style={{ color: "#d93025" }} />
                <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                  Media
                </h3>
              </div>

              <MediaUpload subscriptionStatus={student.subscription_status ?? "free"} />

              <MediaGallery />
            </div>

            {/* CARD 4: Academic Profile & Goals */}
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

          </div>
        </div>
      </div>
    </>
  );
}
