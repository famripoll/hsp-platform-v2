import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "../../student/LogOutButton";
import ChangePasswordForm from "./ChangePasswordForm";
import { Settings } from "lucide-react";

export default async function CoachSettingsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    profile.role !== "coach" ||
    (profile.status !== "active" && profile.status !== "pending")
  ) {
    redirect("/login");
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            href="/dashboard/coach"
            className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/coach/settings"
              className="flex items-center gap-1 text-sm text-[#d93025] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <LogOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Account Settings</h1>

        <div className="flex flex-col gap-6">
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
