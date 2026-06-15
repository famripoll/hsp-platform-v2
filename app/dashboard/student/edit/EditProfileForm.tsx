"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type StudentData = {
  high_school?: string | null;
  grade?: string | null;
  graduation_year?: string | null;
  primary_position?: string | null;
  secondary_position?: string | null;
  bats?: string | null;
  throws?: string | null;
  height?: string | null;
  weight?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  snapchat_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  parent_relationship?: string | null;
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
  gpa?: number | null;
  sat_score?: string | null;
  act_score?: string | null;
  intended_major?: string | null;
};

const POSITIONS = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
const FIXED_RELATIONSHIPS = ["Mother", "Father", "Grandparent", "Guardian", "Sibling"];

const INPUT = "border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent";
const LABEL = "text-sm font-medium text-gray-600 mb-1 block";
const SECTION_TITLE = "text-xl font-bold text-[#0f172a] mb-5";

export default function EditProfileForm({
  initialFullName,
  initialData,
  userId,
}: {
  initialFullName: string;
  initialData: StudentData;
  userId: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [satError, setSatError] = useState<string | null>(null);
  const [actError, setActError] = useState<string | null>(null);

  const initialRelationship = initialData.parent_relationship ?? "";
  const isFixedRelationship = FIXED_RELATIONSHIPS.includes(initialRelationship);

  const [form, setForm] = useState({
    full_name: initialFullName,
    high_school: initialData.high_school ?? "",
    grade: initialData.grade ?? "",
    graduation_year: initialData.graduation_year ?? "",
    primary_position: initialData.primary_position ?? "",
    secondary_position: initialData.secondary_position ?? "",
    bats: initialData.bats ?? "",
    throws: initialData.throws ?? "",
    height: initialData.height ?? "",
    weight: initialData.weight ?? "",
    city: initialData.city ?? "",
    state: initialData.state ?? "",
    phone: initialData.phone ?? "",
    facebook_url: initialData.facebook_url ?? "",
    instagram_url: initialData.instagram_url ?? "",
    snapchat_url: initialData.snapchat_url ?? "",
    tiktok_url: initialData.tiktok_url ?? "",
    x_url: initialData.x_url ?? "",
    parent_name: initialData.parent_name ?? "",
    parent_email: initialData.parent_email ?? "",
    parent_phone: initialData.parent_phone ?? "",
    parent_relationship: isFixedRelationship ? initialRelationship : (initialRelationship ? "Other" : ""),
    parent_relationship_other: isFixedRelationship ? "" : initialRelationship,
    coach_name: initialData.coach_name ?? "",
    coach_email: initialData.coach_email ?? "",
    coach_phone: initialData.coach_phone ?? "",
    stat_ab: initialData.stat_ab ?? "",
    stat_h: initialData.stat_h ?? "",
    stat_2b: initialData.stat_2b ?? "",
    stat_3b: initialData.stat_3b ?? "",
    stat_r: initialData.stat_r ?? "",
    stat_avg: initialData.stat_avg ?? "",
    stat_obp: initialData.stat_obp ?? "",
    stat_slg: initialData.stat_slg ?? "",
    stat_ops: initialData.stat_ops ?? "",
    stat_rbi: initialData.stat_rbi ?? "",
    stat_hr: initialData.stat_hr ?? "",
    stat_sb: initialData.stat_sb ?? "",
    stat_fpd: initialData.stat_fpd ?? "",
    stat_era: initialData.stat_era ?? "",
    stat_whip: initialData.stat_whip ?? "",
    stat_ip: initialData.stat_ip ?? "",
    stat_k: initialData.stat_k ?? "",
    stat_bb: initialData.stat_bb ?? "",
    stat_kbb: initialData.stat_kbb ?? "",
    stat_velo: initialData.stat_velo ?? "",
    gpa: initialData.gpa != null ? String(initialData.gpa) : "",
    sat_score: initialData.sat_score ?? "",
    act_score: initialData.act_score ?? "",
    intended_major: initialData.intended_major ?? "",
  });

  type FormKey = keyof typeof form;

  function set(field: FormKey) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  const formatUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (satError || actError) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name })
      .eq("id", userId);

    if (profileErr) {
      setSaving(false);
      setError(profileErr.message);
      return;
    }

    const resolvedParentRelationship =
      form.parent_relationship === "Other"
        ? form.parent_relationship_other.trim()
        : form.parent_relationship;

    const { error: studentErr } = await supabase
      .from("students")
      .update({
        high_school: form.high_school || null,
        grade: form.grade || null,
        graduation_year: form.graduation_year || null,
        primary_position: form.primary_position || null,
        secondary_position: form.secondary_position || null,
        bats: form.bats || null,
        throws: form.throws || null,
        height: form.height || null,
        weight: form.weight || null,
        city: form.city || null,
        state: form.state || null,
        phone: form.phone || null,
        facebook_url: form.facebook_url ? formatUrl(form.facebook_url) : null,
        instagram_url: form.instagram_url ? formatUrl(form.instagram_url) : null,
        snapchat_url: form.snapchat_url ? formatUrl(form.snapchat_url) : null,
        tiktok_url: form.tiktok_url ? formatUrl(form.tiktok_url) : null,
        x_url: form.x_url ? formatUrl(form.x_url) : null,
        parent_name: form.parent_name || null,
        parent_email: form.parent_email || null,
        parent_phone: form.parent_phone || null,
        parent_relationship: resolvedParentRelationship || null,
        coach_name: form.coach_name || null,
        coach_email: form.coach_email || null,
        coach_phone: form.coach_phone || null,
        stat_ab: form.stat_ab || null,
        stat_h: form.stat_h || null,
        stat_2b: form.stat_2b || null,
        stat_3b: form.stat_3b || null,
        stat_r: form.stat_r || null,
        stat_avg: form.stat_avg || null,
        stat_obp: form.stat_obp || null,
        stat_slg: form.stat_slg || null,
        stat_ops: form.stat_ops || null,
        stat_rbi: form.stat_rbi || null,
        stat_hr: form.stat_hr || null,
        stat_sb: form.stat_sb || null,
        stat_fpd: form.stat_fpd || null,
        stat_era: form.stat_era || null,
        stat_whip: form.stat_whip || null,
        stat_ip: form.stat_ip || null,
        stat_k: form.stat_k || null,
        stat_bb: form.stat_bb || null,
        stat_kbb: form.stat_kbb || null,
        stat_velo: form.stat_velo || null,
        gpa: form.gpa ? parseFloat(form.gpa) : null,
        sat_score: form.sat_score || null,
        act_score: form.act_score || null,
        intended_major: form.intended_major || null,
      })
      .eq("profile_id", userId);

    if (studentErr) {
      setSaving(false);
      setError(studentErr.message);
      return;
    }

    router.push("/dashboard/student");
  }

  const positionStats: { label: string; field: FormKey; step?: string; decimal?: boolean }[] = [
    { label: "AB", field: "stat_ab", step: "1" },
    { label: "H", field: "stat_h", step: "1" },
    { label: "2B", field: "stat_2b", step: "1" },
    { label: "3B", field: "stat_3b", step: "1" },
    { label: "HR", field: "stat_hr", step: "1" },
    { label: "AVG", field: "stat_avg", decimal: true },
    { label: "OBP", field: "stat_obp", decimal: true },
    { label: "SLG", field: "stat_slg", decimal: true },
    { label: "R", field: "stat_r", step: "1" },
    { label: "RBI", field: "stat_rbi", step: "1" },
    { label: "SB", field: "stat_sb", step: "1" },
  ];

  const pitcherStats: { label: string; field: FormKey; step: string }[] = [
    { label: "ERA", field: "stat_era", step: "0.01" },
    { label: "WHIP", field: "stat_whip", step: "0.01" },
    { label: "IP", field: "stat_ip", step: "0.1" },
    { label: "K", field: "stat_k", step: "1" },
    { label: "BB", field: "stat_bb", step: "1" },
    { label: "K/BB", field: "stat_kbb", step: "0.01" },
    { label: "VELO mph", field: "stat_velo", step: "1" },
  ];

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Section 1: Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className={SECTION_TITLE}>Personal Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={LABEL}>Full Name</label>
              <input type="text" className={INPUT} value={form.full_name} onChange={set("full_name")} />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>High School</label>
              <input type="text" className={INPUT} value={form.high_school} onChange={set("high_school")} />
            </div>
            <div>
              <label className={LABEL}>Graduation Year</label>
              <input
                type="text"
                className={INPUT}
                value={form.graduation_year}
                onChange={(e) => {
                  const graduationYear = e.target.value;
                  const currentYear = new Date().getFullYear();
                  const gradNum = 12 - (parseInt(graduationYear) - currentYear);
                  const newGrade = gradNum >= 9 && gradNum <= 12 ? `Grade ${gradNum}` : "";
                  setForm((prev) => ({ ...prev, graduation_year: graduationYear, grade: newGrade }));
                }}
              />
            </div>
            <div>
              <label className={LABEL}>Grade</label>
              <select
                className={INPUT}
                value={form.grade}
                onChange={(e) => {
                  const grade = e.target.value;
                  const currentYear = new Date().getFullYear();
                  const gradeNumber = parseInt(grade.replace("Grade ", ""));
                  const graduationYear = grade ? (currentYear + (12 - gradeNumber)).toString() : "";
                  setForm((prev) => ({ ...prev, grade, graduation_year: graduationYear }));
                }}
              >
                <option value="">Select…</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Primary Position</label>
              <select className={INPUT} value={form.primary_position} onChange={set("primary_position")}>
                <option value="">Select…</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Secondary Position</label>
              <select className={INPUT} value={form.secondary_position} onChange={set("secondary_position")}>
                <option value="">None</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Bats</label>
              <select className={INPUT} value={form.bats} onChange={set("bats")}>
                <option value="">Select…</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Switch">Switch</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Throws</label>
              <select className={INPUT} value={form.throws} onChange={set("throws")}>
                <option value="">Select…</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>{"Height (e.g. 5'7\")"}</label>
              <input type="text" className={INPUT} value={form.height} onChange={set("height")} placeholder={"5'7\""} />
            </div>
            <div>
              <label className={LABEL}>Weight (e.g. 145)</label>
              <input type="text" className={INPUT} value={form.weight} onChange={set("weight")} placeholder="145" />
            </div>
            <div>
              <label className={LABEL}>City</label>
              <input type="text" className={INPUT} value={form.city} onChange={set("city")} />
            </div>
            <div>
              <label className={LABEL}>State</label>
              <input type="text" className={INPUT} value={form.state} onChange={set("state")} placeholder="Florida" />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL}>Phone</label>
              <input
                type="text"
                className={INPUT}
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))}
                placeholder="239-123-4567"
              />
            </div>
            <div>
              <label className={LABEL}>Facebook URL</label>
              <input type="text" className={INPUT} value={form.facebook_url} onChange={set("facebook_url")} placeholder="https://facebook.com/yourprofile" />
            </div>
            <div>
              <label className={LABEL}>Instagram URL</label>
              <input type="text" className={INPUT} value={form.instagram_url} onChange={set("instagram_url")} placeholder="https://instagram.com/yourprofile" />
            </div>
            <div>
              <label className={LABEL}>Snapchat URL</label>
              <input type="text" className={INPUT} value={form.snapchat_url} onChange={set("snapchat_url")} placeholder="https://snapchat.com/add/username" />
            </div>
            <div>
              <label className={LABEL}>TikTok URL</label>
              <input type="text" className={INPUT} value={form.tiktok_url} onChange={set("tiktok_url")} placeholder="https://tiktok.com/@username" />
            </div>
            <div>
              <label className={LABEL}>X URL</label>
              <input type="text" className={INPUT} value={form.x_url} onChange={set("x_url")} placeholder="https://x.com/username" />
            </div>
          </div>
        </div>

        {/* Section 2: Parent / Guardian Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className={SECTION_TITLE}>Parent / Guardian Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={LABEL}>Parent Name</label>
              <input type="text" className={INPUT} value={form.parent_name} onChange={set("parent_name")} />
            </div>
            <div>
              <label className={LABEL}>Parent Email</label>
              <input type="text" className={INPUT} value={form.parent_email} onChange={set("parent_email")} />
            </div>
            <div>
              <label className={LABEL}>Parent Phone</label>
              <input
                type="text"
                className={INPUT}
                value={form.parent_phone}
                onChange={(e) => setForm((prev) => ({ ...prev, parent_phone: formatPhone(e.target.value) }))}
                placeholder="239-123-4567"
              />
            </div>
            <div>
              <label className={LABEL}>Relationship to Student</label>
              <select
                className={INPUT}
                value={form.parent_relationship}
                onChange={(e) => setForm((prev) => ({ ...prev, parent_relationship: e.target.value, parent_relationship_other: e.target.value === "Other" ? prev.parent_relationship_other : "" }))}
              >
                <option value="">Please select</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Guardian">Guardian</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {form.parent_relationship === "Other" ? (
              <div>
                <label className={LABEL}>Please specify</label>
                <input
                  type="text"
                  className={INPUT}
                  placeholder="e.g. Aunt, Family Friend"
                  value={form.parent_relationship_other}
                  onChange={(e) => setForm((prev) => ({ ...prev, parent_relationship_other: e.target.value }))}
                />
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Section 3: High School Coach Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className={SECTION_TITLE}>High School Coach Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={LABEL}>Coach Name</label>
              <input type="text" className={INPUT} value={form.coach_name} onChange={set("coach_name")} />
            </div>
            <div>
              <label className={LABEL}>Coach Email</label>
              <input type="text" className={INPUT} value={form.coach_email} onChange={set("coach_email")} />
            </div>
            <div>
              <label className={LABEL}>Coach Phone</label>
              <input
                type="text"
                className={INPUT}
                value={form.coach_phone}
                onChange={(e) => setForm((prev) => ({ ...prev, coach_phone: formatPhone(e.target.value) }))}
                placeholder="239-123-4567"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Position Player Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className={SECTION_TITLE}>Position Player Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {positionStats.map(({ label, field, step, decimal }) => (
              <div key={field}>
                <label className={LABEL}>{label}</label>
                {decimal ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className={INPUT}
                    value={form[field]}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const afterDecimal = raw.includes(".")
                        ? raw.split(".")[1] ?? ""
                        : raw.replace(/\D/g, "");
                      const digits = afterDecimal.replace(/\D/g, "").slice(0, 3);
                      const formatted = digits.length > 0 ? "0." + digits : "";
                      setForm((prev) => ({ ...prev, [field]: formatted }));
                    }}
                  />
                ) : (
                  <input
                    type="number"
                    step={step}
                    min="0"
                    className={INPUT}
                    value={form[field]}
                    onChange={set(field)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Pitcher Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className={SECTION_TITLE}>Pitcher Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pitcherStats.map(({ label, field, step }) => (
              <div key={field}>
                <label className={LABEL}>{label}</label>
                <input
                  type="number"
                  step={step}
                  min="0"
                  className={INPUT}
                  value={form[field]}
                  onChange={set(field)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Academic Profile */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className={SECTION_TITLE}>Academic Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="5"
                className={INPUT}
                value={form.gpa}
                onChange={set("gpa")}
              />
            </div>
            <div>
              <label className={LABEL}>SAT Score</label>
              <input
                type="number"
                step="1"
                min="400"
                max="1600"
                className={INPUT}
                value={form.sat_score}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setForm((prev) => ({ ...prev, sat_score: raw }));
                  if (raw === "") {
                    setSatError(null);
                  } else {
                    const n = parseInt(raw);
                    setSatError(n < 400 || n > 1600 ? "SAT score must be between 400 and 1600" : null);
                  }
                }}
              />
              {satError && <p className="text-red-500 text-xs mt-1">{satError}</p>}
            </div>
            <div>
              <label className={LABEL}>ACT Score</label>
              <input
                type="number"
                step="1"
                min="1"
                max="36"
                className={INPUT}
                value={form.act_score}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setForm((prev) => ({ ...prev, act_score: raw }));
                  if (raw === "") {
                    setActError(null);
                  } else {
                    const n = parseInt(raw);
                    setActError(n < 1 || n > 36 ? "ACT score must be between 1 and 36" : null);
                  }
                }}
              />
              {actError && <p className="text-red-500 text-xs mt-1">{actError}</p>}
            </div>
            <div>
              <label className={LABEL}>Intended Major</label>
              <input type="text" className={INPUT} value={form.intended_major} onChange={set("intended_major")} />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#d93025] text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/student")}
            className="border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-6 py-3 hover:bg-red-50 transition-colors transition-transform duration-200 hover:scale-105"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
