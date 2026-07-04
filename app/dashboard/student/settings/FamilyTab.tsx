"use client";

import { useState } from "react";
import { Users, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

const INPUT = "border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent";
const LABEL = "text-sm font-medium text-gray-600 mb-1 block";

type FamilyMember = {
  id: string;
  full_name: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  show_on_profile: boolean;
};

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
        checked ? "bg-[#d93025]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function FamilyTab({
  familyMembers,
  studentId,
  parentName,
  parentEmail,
  parentPhone,
  parentRelationship,
}: {
  familyMembers: FamilyMember[];
  studentId: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  parentRelationship: string | null;
}) {
  const [members, setMembers] = useState<FamilyMember[]>(familyMembers);
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [otherRelationshipText, setOtherRelationshipText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const motherCount = (parentRelationship === "Mother" ? 1 : 0) + members.filter((m) => m.relationship === "Mother").length;
  const fatherCount = (parentRelationship === "Father" ? 1 : 0) + members.filter((m) => m.relationship === "Father").length;
  const grandparentCount = members.filter((m) => m.relationship === "Grandparent").length;

  function clearMessage() {
    setSaveMessage(null);
  }

  async function handleSave() {
    setSaveMessage(null);
    if (!fullName.trim() || !relationship) {
      setSaveMessage("Please fill in Full Name and Relationship.");
      return;
    }
    if (relationship === "Other" && !otherRelationshipText.trim()) {
      setSaveMessage("Please specify the relationship.");
      return;
    }
    if (!studentId) {
      setSaveMessage("Unable to save right now. Please try again later.");
      return;
    }
    const finalRelationship = relationship === "Other" ? otherRelationshipText.trim() : relationship;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        student_id: studentId,
        full_name: fullName.trim(),
        relationship: finalRelationship,
        email: email.trim() || null,
        phone: phone.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      setSaveMessage("Something went wrong. Please try again.");
      return;
    }
    setMembers((prev) => [...prev, data]);
    setFullName("");
    setRelationship("");
    setOtherRelationshipText("");
    setEmail("");
    setPhone("");
    setSaveMessage("Family member added.");

    try {
      await supabase.from("activity").insert({
        student_id: studentId,
        type: "family_member_added",
        title: "Family member added",
        description: `${data.full_name} was added as a ${data.relationship}.`,
      });
    } catch (activityErr) {
      console.error(activityErr);
    }
  }

  async function handleDelete(memberId: string) {
    const deletedMember = members.find((m) => m.id === memberId);
    const supabase = createClient();
    const { error } = await supabase.from("family_members").delete().eq("id", memberId);
    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      if (deletedMember) {
        try {
          await supabase.from("activity").insert({
            student_id: studentId,
            type: "family_member_removed",
            title: "Family member removed",
            description: `${deletedMember.full_name} was removed as a ${deletedMember.relationship}.`,
          });
        } catch (activityErr) {
          console.error(activityErr);
        }
      }
    }
  }

  async function handleToggleShowOnProfile(memberId: string, current: boolean) {
    const newValue = !current;
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, show_on_profile: newValue } : m)));
    const supabase = createClient();
    const { error } = await supabase.from("family_members").update({ show_on_profile: newValue }).eq("id", memberId);
    if (error) {
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, show_on_profile: current } : m)));
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="bg-red-50 rounded-xl p-3 shrink-0">
          <Users size={22} color="#d93025" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">Manage Family</h2>
          <p className="text-sm text-[#64748b]">
            Add contact information for family members you&apos;d like college coaches to be able to reach.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 my-5" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Full Name</label>
          <input
            type="text"
            className={INPUT}
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); clearMessage(); }}
            placeholder="Full name"
          />
        </div>
        <div>
          <label className={LABEL}>Relationship</label>
          <select
            className={INPUT}
            value={relationship}
            onChange={(e) => {
              setRelationship(e.target.value);
              if (e.target.value !== "Other") setOtherRelationshipText("");
              clearMessage();
            }}
          >
            <option value="" disabled>Please select</option>
            {motherCount >= 1
              ? <option value="Mother" disabled>Mother (already added)</option>
              : <option value="Mother">Mother</option>}
            {fatherCount >= 1
              ? <option value="Father" disabled>Father (already added)</option>
              : <option value="Father">Father</option>}
            {grandparentCount >= 4
              ? <option value="Grandparent" disabled>Grandparent (max reached)</option>
              : <option value="Grandparent">Grandparent</option>}
            <option value="Guardian">Guardian</option>
            <option value="Sibling">Sibling</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {relationship === "Other" && (
          <div className="md:col-span-2">
            <label className={LABEL}>Please specify</label>
            <input
              type="text"
              className={INPUT}
              value={otherRelationshipText}
              onChange={(e) => { setOtherRelationshipText(e.target.value); clearMessage(); }}
              placeholder="e.g. Aunt, Family Friend"
            />
          </div>
        )}
      </div>

      <p className="text-sm font-semibold text-[#0f172a] mt-2">Contact Info</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className={LABEL}>Email</label>
          <input
            type="text"
            className={INPUT}
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearMessage(); }}
            placeholder="Email address"
          />
        </div>
        <div>
          <label className={LABEL}>Phone</label>
          <input
            type="text"
            className={INPUT}
            value={phone}
            onChange={(e) => { setPhone(formatPhone(e.target.value)); clearMessage(); }}
            placeholder="Phone number"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#d93025] text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saveMessage && (
          <p className="mt-3 text-sm text-gray-500">{saveMessage}</p>
        )}
      </div>

      <div className="border-t border-gray-100 my-5" />

      <p className="text-sm font-semibold text-[#0f172a] mb-2">Your Family Members</p>

      <p className="text-sm text-[#64748b] mb-3">
        The Parent/Guardian account above is always shown on your dashboard. For any additional family member, use the toggle to choose whether their name and contact info appear in the &apos;Family Contacts&apos; section of your dashboard profile.
      </p>

      <div className="flex flex-col gap-3">
        {parentName && (
          <div className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="font-semibold text-[#0f172a]">{parentName}</p>
              <p className="text-sm text-[#64748b]">{parentRelationship || "Parent/Guardian"}</p>
            </div>
            <div className="text-sm text-[#64748b] sm:text-right">
              <p>{parentEmail || "—"}</p>
              <p>{parentPhone || "—"}</p>
            </div>
          </div>
        )}

        {members.map((member) => (
          <div key={member.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="font-semibold text-[#0f172a]">{member.full_name}</p>
              <p className="text-sm text-[#64748b]">{member.relationship}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-[#64748b] sm:text-right">
                <p>{member.email || "—"}</p>
                <p>{member.phone || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <ToggleSwitch
                  checked={member.show_on_profile}
                  onChange={() => handleToggleShowOnProfile(member.id, member.show_on_profile)}
                />
                <button
                  type="button"
                  onClick={() => handleDelete(member.id)}
                  aria-label="Remove family member"
                  className="text-gray-400 hover:text-[#d93025] transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <p className="text-sm text-[#64748b]">No additional family members added yet.</p>
        )}
      </div>
    </div>
  );
}
