"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

export default function SettingsLink({ isParent }: { isParent: boolean }) {
  if (isParent) {
    return (
      <button
        onClick={() => alert("You are in view-only mode. Only the student can edit this profile.")}
        className="flex items-center gap-1 text-sm text-[#0f172a] hover:text-[#d93025] transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </button>
    );
  }
  return (
    <Link
      href="/dashboard/student/settings"
      className="flex items-center gap-1 text-sm text-[#0f172a] hover:text-[#d93025] transition-colors"
    >
      <Settings className="w-4 h-4" />
      <span className="hidden sm:inline">Settings</span>
    </Link>
  );
}
