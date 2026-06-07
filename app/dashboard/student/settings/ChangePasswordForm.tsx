"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

const INPUT = "border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent";
const LABEL = "text-sm font-medium text-gray-600 mb-1 block";

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-[#0f172a] mb-5">Change Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className={LABEL}>New Password</label>
          <input
            type="password"
            className={INPUT}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label className={LABEL}>Confirm New Password</label>
          <input
            type="password"
            className={INPUT}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
            Password updated successfully.
          </p>
        )}

        <div className="pt-1 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#d93025] text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
          <Link
            href="/dashboard/student"
            className="border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-6 py-3 hover:bg-red-50 transition-colors"
          >
            Back
          </Link>
        </div>
      </form>
    </div>
  );
}
