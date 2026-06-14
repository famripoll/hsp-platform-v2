"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { Lock, Eye, EyeOff } from "lucide-react";

const INPUT = "border border-gray-200 rounded-lg pl-9 pr-9 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-transparent";
const LABEL = "text-sm font-medium text-gray-600 mb-1 block";

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPwVisible, setNewPwVisible] = useState(false);
  const [confirmPwVisible, setConfirmPwVisible] = useState(false);

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
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-full grid grid-rows-[auto_1fr]">
      <div className="flex items-start gap-3">
        <div className="bg-red-50 rounded-xl p-3 shrink-0">
          <Lock size={22} color="#d93025" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0f172a]">Security</h2>
          <p className="text-sm text-[#64748b]">Change your password to keep your account secure.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col max-w-sm justify-between">
        <div>
          <div className="border-t border-gray-100 my-5" />
          <div className="flex flex-col gap-4">
            <div>
              <label className={LABEL}>New Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type={newPwVisible ? "text" : "password"}
                  className={INPUT}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setNewPwVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={newPwVisible ? "Hide password" : "Show password"}
                >
                  {newPwVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={LABEL}>Confirm New Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type={confirmPwVisible ? "text" : "password"}
                  className={INPUT}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setConfirmPwVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={confirmPwVisible ? "Hide password" : "Show password"}
                >
                  {confirmPwVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
                Password updated successfully.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="border-t border-gray-100 my-5" />
          <div className="pt-1 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#d93025] text-white font-semibold rounded-xl px-6 py-3 hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-105 disabled:opacity-60"
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
        </div>
      </form>
    </div>
  );
}
