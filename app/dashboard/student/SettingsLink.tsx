"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

export default function SettingsLink() {
  const isActive = usePathname().endsWith("/settings");

  return (
    <Link
      href="/dashboard/student/settings"
      className={`flex items-center gap-1 text-sm transition-colors ${
        isActive ? "text-[#d93025]" : "text-[#0f172a] hover:text-[#d93025]"
      }`}
    >
      <Settings className="w-4 h-4" />
      <span className="hidden sm:inline">Settings</span>
    </Link>
  );
}
