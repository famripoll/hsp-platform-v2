import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "./LogOutButton";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import StudentTabs from "./StudentTabs";
import {
  MapPin,
  Mail,
  Phone,
  Settings,
  Calendar,
  User,
  Pencil,
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
  snapchat_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
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

const formatUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

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
  const initialTab =
    params.tab === "search" ? "search" :
    params.tab === "target" ? "target" :
    params.tab === "notifications" ? "notifications" :
    "overview";
  const initialStatsTab = params.stats === "pitcher" ? "pitcher" : "position";

  return (
    <>
      {/* Dashboard Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between min-w-0">
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
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <div className="grid w-full grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* ── LEFT COLUMN: Player Profile Card ── */}
          <div className="md:col-span-1 w-full">
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 w-full">

              {/* Avatar + Name + Info + Edit Profile */}
              <div className="relative flex flex-col -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-0 bg-gradient-to-b from-red-50 to-white rounded-t-2xl">
                <Link href="/dashboard/student/edit" className="absolute top-3 right-3">
                  <button className="p-1 rounded-md text-[#64748b] hover:text-[#d93025] hover:bg-red-50 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </Link>
                <div className="flex flex-row items-start gap-4 px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
                  <div className="shrink-0">
                    <ProfilePhotoUpload initialPhotoUrl={student.photo_url ?? null} size="w-20 h-20" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-[#0f172a] leading-tight truncate">
                      {profile.full_name ?? DASH}
                    </h2>

                    <div className="border-b border-gray-200 my-1" />

                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#64748b] shrink-0" />
                      <span className="text-sm text-[#64748b] truncate">
                        {student.high_school ?? DASH}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-[#64748b] shrink-0" />
                        <span className="text-sm text-[#64748b] whitespace-nowrap">
                          {student.graduation_year
                            ? `Class of ${student.graduation_year}`
                            : student.grade
                            ? `Grade ${student.grade}`
                            : DASH}
                        </span>
                      </div>
                      <span className="text-sm text-[#64748b]">|</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <User className="w-4 h-4 text-[#d93025] shrink-0" />
                        <span className="text-sm font-semibold text-[#d93025] whitespace-nowrap">Position:</span>
                        <span className="text-sm text-[#0f172a] truncate">
                          {student.primary_position
                            ? student.secondary_position
                              ? `${student.primary_position}, ${student.secondary_position}`
                              : student.primary_position
                            : DASH}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats 2×2 Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5 border-t border-gray-100 pt-4">
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

                {/* Academics */}
                <div className="border-t border-gray-100 pt-4">
                  <p
                    className="text-xs font-semibold uppercase mb-2"
                    style={{ color: "#d93025" }}
                  >
                    Academics
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "GPA", value: student.gpa?.toString() ?? DASH },
                      { label: "SAT", value: student.sat_score ?? DASH },
                      { label: "ACT", value: student.act_score ?? DASH },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl px-2 py-2 text-center"
                        style={{ backgroundColor: "#F2F3F3" }}
                      >
                        <p
                          className="text-[10px] font-semibold uppercase mb-0.5"
                          style={{ color: "#64748b" }}
                        >
                          {item.label}
                        </p>
                        <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-xs font-semibold uppercase mb-1"
                    style={{ color: "#64748b" }}
                  >
                    Intended Major
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
                    {student.intended_major ?? DASH}
                  </p>
                </div>

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
                  {profile.email ? (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm cursor-default" style={{ color: "#cbd5e1" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}
                  {student.phone ? (
                    <a
                      href={`tel:${student.phone}`}
                      className="flex items-center gap-2 text-sm mt-1 hover:opacity-80"
                      style={{ color: "#64748b" }}
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {student.phone}
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-sm mt-1 cursor-default" style={{ color: "#cbd5e1" }}>
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {[
                      { name: "Facebook", url: student.facebook_url, color: "#1877F2", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                      { name: "Instagram", url: student.instagram_url, color: "#E1306C", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                      { name: "Snapchat", url: student.snapchat_url, color: "#F7B731", path: "M12.166.009C9.639.009 6.856 1.157 5.23 3.37c-.959 1.302-1.404 2.95-1.306 4.898v.005l-.091.052c-.361.207-.753.312-1.164.312-.307 0-.598-.058-.863-.17l-.098-.043-.104.009c-.04.003-.079.005-.117.005-.337 0-.587-.095-.704-.267-.072-.105-.085-.237-.038-.374l.025-.07-.038-.065C.648 7.448.5 7.057.5 6.65c0-.547.209-.994.602-1.295.14-.107.3-.184.476-.228l.171-.043.018-.175c.025-.247.21-.44.451-.487l.121-.023.079-.093C2.79 3.87 4.186 2.694 6.057 1.839 7.844.994 9.854.5 12 .5s4.156.494 5.943 1.339c1.871.855 3.267 2.031 4.123 3.467l.079.093.121.023c.241.047.426.24.451.487l.018.175.171.043c.176.044.336.121.476.228.393.301.602.748.602 1.295 0 .407-.148.798-.232.993l-.038.065.025.07c.047.137.034.269-.038.374-.117.172-.367.267-.704.267-.038 0-.077-.002-.117-.005l-.104-.009-.098.043c-.265.112-.556.17-.863.17-.411 0-.803-.105-1.164-.312l-.091-.052v-.005c.098-1.948-.347-3.596-1.306-4.898C17.144 1.157 14.361.009 12.166.009zM23.469 15.98l-.102-.027c-.608-.162-1.181-.584-1.7-1.254-.341-.439-.582-.896-.697-1.131-.028-.057-.048-.097-.061-.12l-.057-.105-.118-.025c-.095-.02-.195-.03-.296-.03-.294 0-.584.082-.812.23-.734.475-1.506.716-2.295.716-.27 0-.539-.026-.8-.077l-.052-.01-.05.017c-.146.051-.294.076-.44.076-.266 0-.498-.08-.651-.22-.085-.077-.135-.163-.148-.252l-.017-.113-.088-.073c-1.045-.867-1.927-1.948-2.623-3.215l-.057-.104-.118-.017c-.29-.04-.569-.194-.761-.419-.184-.215-.255-.465-.196-.698.068-.268.303-.471.625-.545l.106-.025.058-.092C12.398 8.6 12.5 8.1 12.5 7.5c0-.863-.336-1.58-.97-2.076-.532-.42-1.236-.641-2.03-.641-.794 0-1.498.221-2.03.641C6.836 5.92 6.5 6.637 6.5 7.5c0 .6.102 1.1.45 1.563l.058.092.106.025c.322.074.557.277.625.545.059.233-.012.483-.196.698-.192.225-.471.379-.761.419l-.118.017-.057.104c-.696 1.267-1.578 2.348-2.623 3.215l-.088.073-.017.113c-.013.089-.063.175-.148.252-.153.14-.385.22-.651.22-.146 0-.294-.025-.44-.076l-.05-.017-.052.01c-.261.051-.53.077-.8.077-.789 0-1.561-.241-2.295-.716-.228-.148-.518-.23-.812-.23-.101 0-.201.01-.296.03l-.118.025-.057.105c-.013.023-.033.063-.061.12-.115.235-.356.692-.697 1.131-.519.67-1.092 1.092-1.7 1.254l-.102.027-.024.101c-.075.311.183.638.553.683l.138.017.067.121c.194.348.457.535.783.535.114 0 .236-.022.364-.065l.129-.044.117.075c.478.307.887.459 1.252.465l.037.001c.31 0 .613-.092.927-.281l.134-.081.148.047c.58.184 1.194.327 1.826.425l.108.017.073.083c.573.651 1.399 1.039 2.368 1.039.317 0 .64-.044.961-.131l.127-.034.11.073c.576.383 1.264.585 1.994.585s1.418-.202 1.994-.585l.11-.073.127.034c.321.087.644.131.961.131.969 0 1.795-.388 2.368-1.039l.073-.083.108-.017c.632-.098 1.246-.241 1.826-.425l.148-.047.134.081c.314.189.617.281.927.281l.037-.001c.365-.006.774-.158 1.252-.465l.117-.075.129.044c.128.043.25.065.364.065.326 0 .589-.187.783-.535l.067-.121.138-.017c.37-.045.628-.372.553-.683l-.024-.101z" },
                      { name: "TikTok", url: student.tiktok_url, color: "#000000", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.72a8.19 8.19 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z" },
                      { name: "X", url: student.x_url, color: "#000000", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" },
                    ]
                      .sort((a, b) => (b.url ? 1 : 0) - (a.url ? 1 : 0))
                      .map((platform) =>
                        platform.url ? (
                          <a
                            key={platform.name}
                            href={formatUrl(platform.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={platform.name}
                            style={{ color: platform.color }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d={platform.path} />
                            </svg>
                          </a>
                        ) : (
                          <svg key={platform.name} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#cbd5e1] cursor-default">
                            <path d={platform.path} />
                          </svg>
                        )
                      )}
                  </div>
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
                  {student.parent_email ? (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{student.parent_email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm cursor-default" style={{ color: "#cbd5e1" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}
                  {student.parent_phone ? (
                    <a
                      href={`tel:${student.parent_phone}`}
                      className="flex items-center gap-2 text-sm mt-1 hover:opacity-80"
                      style={{ color: "#64748b" }}
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {student.parent_phone}
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-sm mt-1 cursor-default" style={{ color: "#cbd5e1" }}>
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                    </div>
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
                  {student.coach_email ? (
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{student.coach_email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm cursor-default" style={{ color: "#cbd5e1" }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}
                  {student.coach_phone ? (
                    <a
                      href={`tel:${student.coach_phone}`}
                      className="flex items-center gap-2 text-sm mt-1 hover:opacity-80"
                      style={{ color: "#64748b" }}
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {student.coach_phone}
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-sm mt-1 cursor-default" style={{ color: "#cbd5e1" }}>
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: client-side tabs ── */}
          <StudentTabs
            student={student}
            initialTab={initialTab}
            initialStatsTab={initialStatsTab}
          />

        </div>
      </div>
    </>
  );
}
