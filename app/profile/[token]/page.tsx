import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import PublicPhotoLightboxController from "./PublicPhotoLightboxController";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Token-based, request-time only. Signed media URLs expire in an hour, so this
// page must never be cached.
export const dynamic = "force-dynamic";

// This page renders a minor's name, photo, video, school and location behind a
// 30-day token with revocation and subscription gates. Search-engine indexing
// would outlive the token and defeat those gates, so keep the route out of the
// index, its links unfollowed, and out of caches, snapshots and previews —
// unconditionally, on every branch below.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DASH = "—";

const STUDENT_SELECT =
  "profile_id, subscription_status, primary_position, secondary_position, graduation_year, grade, high_school, city, state, bats, throws, height, weight, gpa, sat_score, act_score, intended_major, photo_url, stat_ab, stat_h, stat_2b, stat_3b, stat_r, stat_avg, stat_obp, stat_slg, stat_rbi, stat_hr, stat_sb, stat_era, stat_whip, stat_ip, stat_k, stat_bb, stat_kbb, stat_velo";

type StateCardProps = {
  heading: string;
  body: string;
};

function StateCard({ heading, body }: StateCardProps) {
  return (
    <div>
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Student</span>{" "}
          <span className="text-hsp-dark">Profile</span>
        </h1>
      </section>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col gap-5 items-center text-center">
          <h2 className="text-xl font-bold text-hsp-dark">{heading}</h2>
          <p className="text-sm text-hsp-gray">{body}</p>
          <Link
            href="/"
            className="w-full py-3 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200 text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
      {items.map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            {s.value}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#5A6779" }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function PublicStudentProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const notFoundState = (
    <StateCard
      heading="Profile not found"
      body="We couldn't find a student profile for this link. Please double-check the link you were sent."
    />
  );

  if (!token || !UUID_RE.test(token)) {
    return notFoundState;
  }

  const { data: contactRows } = await supabaseAdmin
    .from("college_contacts")
    .select(
      "id, student_id, institution_name, profile_token_expires_at, profile_token_revoked_at"
    )
    .eq("profile_token", token)
    .limit(1);

  if (!contactRows || contactRows.length === 0) {
    return notFoundState;
  }

  const contact = contactRows[0];

  if (
    contact.profile_token_expires_at &&
    new Date(contact.profile_token_expires_at).getTime() < Date.now()
  ) {
    return (
      <StateCard
        heading="This link has expired"
        body="The link to this student profile is no longer valid. Reach out to the athlete's family for an up-to-date link."
      />
    );
  }

  const inactiveState = (
    <StateCard
      heading="This profile is no longer active"
      body="This student profile is not currently available. The athlete may have paused or ended their membership."
    />
  );

  if (contact.profile_token_revoked_at) {
    return inactiveState;
  }

  const { data: studentRows } = await supabaseAdmin
    .from("students")
    .select(STUDENT_SELECT)
    .eq("id", contact.student_id)
    .limit(1);

  if (!studentRows || studentRows.length === 0) {
    return notFoundState;
  }

  const student = studentRows[0] as Record<string, string | number | null>;

  if (student.subscription_status !== "paid") {
    return inactiveState;
  }

  // Past every gate above, this request renders the real profile — so record a
  // view against this college's contact row. The counter is bumped Postgres-side
  // (col = col + 1) so two concurrent opens can't lose a count, and the whole
  // thing runs in `after()` so it neither delays the render nor, if it fails,
  // breaks the page. Requires this function on the database:
  //   create or replace function increment_profile_view(contact_id uuid)
  //   returns void language sql security definer as $$
  //     update college_contacts
  //        set profile_view_count      = profile_view_count + 1,
  //            profile_last_viewed_at  = now(),
  //            profile_first_viewed_at = coalesce(profile_first_viewed_at, now())
  //      where id = contact_id;
  //   $$;
  const viewedContactId = contact.id;
  after(async () => {
    try {
      await supabaseAdmin.rpc("increment_profile_view", {
        contact_id: viewedContactId,
      });
    } catch {
      // A failed counter is not a failed page.
    }
  });

  const profileId =
    typeof student.profile_id === "string" ? student.profile_id : null;

  let fullName: string | null = null;
  if (profileId) {
    const { data: profileRows } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", profileId)
      .limit(1);
    fullName = (profileRows?.[0]?.full_name as string | null) ?? null;
  }

  // Avatar (header only)
  let avatarUrl: string | null = null;
  const photoPath =
    typeof student.photo_url === "string" ? student.photo_url : null;
  if (photoPath) {
    if (photoPath.startsWith("http")) {
      avatarUrl = photoPath;
    } else {
      const { data } = await supabaseAdmin.storage
        .from("profile-photos")
        .createSignedUrl(photoPath, 3600);
      avatarUrl = data?.signedUrl ?? null;
    }
  }

  let photoUrls: string[] = [];
  let videoUrl: string | null = null;
  let photoTotal = 0;
  let videoTotal = 0;

  if (profileId) {
    const [
      { count: pCount },
      { count: vCount },
      { data: photoRows },
      { data: videoRows },
    ] = await Promise.all([
      supabaseAdmin
        .from("student_media")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .eq("media_type", "photo"),
      supabaseAdmin
        .from("student_media")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .eq("media_type", "video"),
      supabaseAdmin
        .from("student_media")
        .select("file_path")
        .eq("profile_id", profileId)
        .eq("media_type", "photo")
        .order("created_at", { ascending: false })
        .limit(2),
      supabaseAdmin
        .from("student_media")
        .select("file_path")
        .eq("profile_id", profileId)
        .eq("media_type", "video")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    photoTotal = pCount ?? 0;
    videoTotal = vCount ?? 0;

    photoUrls = (
      await Promise.all(
        (photoRows ?? []).map(async (r) => {
          const { data } = await supabaseAdmin.storage
            .from("student-photos")
            .createSignedUrl(r.file_path as string, 3600);
          return data?.signedUrl ?? null;
        })
      )
    ).filter((u): u is string => Boolean(u));

    if (videoRows && videoRows.length > 0) {
      const { data } = await supabaseAdmin.storage
        .from("student-videos")
        .createSignedUrl(videoRows[0].file_path as string, 3600);
      videoUrl = data?.signedUrl ?? null;
    }
  }

  const v = (key: string) => {
    const raw = student[key];
    return raw === null || raw === undefined || raw === "" ? DASH : String(raw);
  };

  // Batting rate stats follow baseball convention and drop the leading zero
  // (.325, not 0.325). Only a "0" directly before the decimal point is stripped,
  // so 1.000 and the em-dash placeholder are left untouched.
  const rate = (key: string) => {
    const value = v(key);
    return value === DASH ? value : value.replace(/^0\./, ".");
  };

  const position = student.primary_position
    ? student.secondary_position
      ? `${student.primary_position}, ${student.secondary_position}`
      : String(student.primary_position)
    : DASH;

  const location =
    [student.high_school, student.city, student.state]
      .filter(Boolean)
      .join(", ") || DASH;

  // Hitting always renders. Pitching renders only when "P" is a primary or
  // secondary position; when it does, primary_position "P" puts it first.
  const isPitcher =
    student.primary_position === "P" || student.secondary_position === "P";
  const pitcherFirst = student.primary_position === "P";

  const hittingStats = [
    { label: "AB", value: v("stat_ab") },
    { label: "H", value: v("stat_h") },
    { label: "2B", value: v("stat_2b") },
    { label: "3B", value: v("stat_3b") },
    { label: "HR", value: v("stat_hr") },
    { label: "R", value: v("stat_r") },
    { label: "RBI", value: v("stat_rbi") },
    { label: "SB", value: v("stat_sb") },
    { label: "AVG", value: rate("stat_avg") },
    { label: "OBP", value: rate("stat_obp") },
    { label: "SLG", value: rate("stat_slg") },
  ];

  const pitchingStats = [
    { label: "ERA", value: v("stat_era") },
    { label: "WHIP", value: v("stat_whip") },
    { label: "IP", value: v("stat_ip") },
    { label: "K", value: v("stat_k") },
    { label: "BB", value: v("stat_bb") },
    { label: "K/BB", value: v("stat_kbb") },
    { label: "VELO mph", value: v("stat_velo") },
  ];

  const morePhotos = Math.max(photoTotal - photoUrls.length, 0);
  const moreVideos = Math.max(videoTotal - (videoUrl ? 1 : 0), 0);

  const hittingBlock = (
    <>
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "#CE2C22" }}
      >
        Hitting
      </p>
      <StatGrid items={hittingStats} />
    </>
  );

  const pitchingBlock = (
    <>
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "#CE2C22" }}
      >
        Pitching
      </p>
      <StatGrid items={pitchingStats} />
    </>
  );

  const statBlocks = !isPitcher
    ? [{ key: "hitting", node: hittingBlock }]
    : pitcherFirst
    ? [
        { key: "pitching", node: pitchingBlock },
        { key: "hitting", node: hittingBlock },
      ]
    : [
        { key: "hitting", node: hittingBlock },
        { key: "pitching", node: pitchingBlock },
      ];

  return (
    <div className="max-w-[900px] mx-auto pb-12">
      <div className="flex flex-col gap-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-row items-start gap-4">
            <div className="shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: "#CE2C22" }}
                >
                  {initials(fullName)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] leading-tight">
                {fullName ?? DASH}
              </h1>
              <p className="text-sm font-semibold text-[#CE2C22] mt-1">
                {position}
              </p>
              <p className="text-sm text-[#5A6779] mt-1">
                {student.graduation_year
                  ? `Class of ${student.graduation_year}`
                  : student.grade
                  ? String(student.grade)
                  : DASH}
              </p>
              <p className="text-sm text-[#5A6779] mt-1 break-words">
                {location}
              </p>
            </div>
          </div>
        </div>

        {/* Bio / vitals */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <p
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: "#CE2C22" }}
          >
            Player Info
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Bats", value: v("bats") },
              { label: "Throws", value: v("throws") },
              { label: "Height", value: v("height") },
              { label: "Weight", value: v("weight") },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3"
                style={{ backgroundColor: "#F2F3F3" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase mb-1"
                  style={{ color: "#5A6779" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: "#0f172a" }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Academics */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <p
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: "#CE2C22" }}
          >
            Academics
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "GPA", value: v("gpa") },
              { label: "SAT", value: v("sat_score") },
              { label: "ACT", value: v("act_score") },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl px-2 py-2 text-center"
                style={{ backgroundColor: "#F2F3F3" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase mb-0.5"
                  style={{ color: "#5A6779" }}
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
            style={{ color: "#5A6779" }}
          >
            Intended Major
          </p>
          <p className="text-sm font-bold" style={{ color: "#0f172a" }}>
            {v("intended_major")}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0f172a" }}>
            Stats
          </h2>
          {statBlocks.map((block, i) => (
            <div key={block.key} className={i === 0 ? "" : "mt-6"}>
              {block.node}
            </div>
          ))}
        </div>

        {/* Media */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: "#0f172a" }}>
            Media
          </h2>

          {photoUrls.length === 0 && !videoUrl ? (
            <p className="text-sm" style={{ color: "#5A6779" }}>
              No photos or videos have been shared yet.
            </p>
          ) : (
            <div className="space-y-8">
              {photoUrls.length > 0 && (
                <section>
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: "#CE2C22" }}
                  >
                    Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {photoUrls.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        data-public-photo-lightbox-trigger
                        aria-label={`Enlarge ${fullName ?? "student"} photo ${i + 1}`}
                        aria-haspopup="dialog"
                        className="aspect-square w-full rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CE2C22]"
                      >
                        <img
                          src={url}
                          alt={`${fullName ?? "Student"} photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  {morePhotos > 0 && (
                    <p className="text-xs mt-2" style={{ color: "#5A6779" }}>
                      +{morePhotos} more photo{morePhotos === 1 ? "" : "s"}
                    </p>
                  )}
                  <PublicPhotoLightboxController />
                </section>
              )}

              {videoUrl && (
                <section>
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: "#CE2C22" }}
                  >
                    Video
                  </h3>
                  <div className="rounded-xl overflow-hidden bg-gray-900">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-xl"
                      style={{ maxHeight: "260px" }}
                    />
                  </div>
                  {moreVideos > 0 && (
                    <p className="text-xs mt-2" style={{ color: "#5A6779" }}>
                      +{moreVideos} more video{moreVideos === 1 ? "" : "s"}
                    </p>
                  )}
                </section>
              )}
            </div>
          )}
        </div>

        {/* Registration invitation */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#0f172a" }}>
            Want to reply to {fullName ? fullName.split(/\s+/)[0] : "this athlete"}?
          </h2>
          <p className="text-sm mb-4" style={{ color: "#5A6779" }}>
            {contact.institution_name
              ? `${contact.institution_name} received this athlete's message. `
              : ""}
            Creating a free coach account lets you respond directly through the
            platform. No cost, and it only takes a minute.
          </p>
          <Link
            href="/signup"
            className="inline-block py-2.5 px-5 rounded-lg bg-hsp-red text-white text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity duration-200"
          >
            Register Free
          </Link>
        </div>
      </div>
    </div>
  );
}
