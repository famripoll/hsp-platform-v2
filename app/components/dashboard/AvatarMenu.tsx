"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { useCurrentUserAvatar } from "@/app/hooks/useCurrentUserAvatar";

export default function AvatarMenu({ isCoach }: { isCoach: boolean }) {
  const router = useRouter();
  const { photoUrl, initials, loading } = useCurrentUserAvatar();
  const [open, setOpen] = useState(false);

  // Close on Escape — same pattern as MediaGallery's keydown handler.
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Logout logic inlined from the former LogOutButton.tsx.
  async function handleLogOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const settingsHref = isCoach
    ? "/dashboard/coach/settings"
    : "/dashboard/student/settings";
  const displayInitials = loading ? "?" : initials;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="w-9 h-9 rounded-full shrink-0 cursor-pointer overflow-hidden flex items-center justify-center"
        style={photoUrl ? undefined : { backgroundColor: "#0f172a" }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-xs">{displayInitials}</span>
        )}
      </button>

      {open && (
        <>
          {/* Invisible full-screen click-catcher — closes the menu on any
              outside click. Transparent (no dimming): this is a small account
              menu, not a full navigation drawer. Sits behind the panel. */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 z-50 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
            {!isCoach && (
              <Link
                href="/dashboard/student"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#0f172a] hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
            )}
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#0f172a] hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-hsp-red border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
