"use client";

import { useState } from "react";
import { Users } from "lucide-react";

const INPUT = "border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent";
const LABEL = "text-sm font-medium text-gray-600 mb-1 block";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function FamilyTab({
  parentName,
  parentEmail,
  parentPhone,
}: {
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
}) {
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function clearMessage() {
    setSaveMessage(null);
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
            onChange={(e) => { setRelationship(e.target.value); clearMessage(); }}
          >
            <option value="" disabled>Please select</option>
            <option>Mother</option>
            <option>Father</option>
            <option>Grandparent</option>
            <option>Guardian</option>
            <option>Sibling</option>
            <option>Other</option>
          </select>
        </div>
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
          onClick={() => setSaveMessage("Family member management isn't available yet. Please check back soon.")}
          className="bg-[#d93025] text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105"
        >
          Save
        </button>
        {saveMessage && (
          <p className="mt-3 text-sm text-gray-500">{saveMessage}</p>
        )}
      </div>

      <div className="border-t border-gray-100 my-5" />

      <p className="text-sm font-semibold text-[#0f172a] mb-2">Your Family Members</p>

      {parentName ? (
        <>
          <div className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <p className="font-semibold text-[#0f172a]">{parentName}</p>
              <p className="text-sm text-[#64748b]">Parent/Guardian</p>
            </div>
            <div className="text-sm text-[#64748b] sm:text-right">
              <p>{parentEmail || "—"}</p>
              <p>{parentPhone || "—"}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-[#64748b]">No additional family members added yet.</p>
        </>
      ) : (
        <p className="text-sm text-[#64748b]">No additional family members added yet.</p>
      )}
    </div>
  );
}
