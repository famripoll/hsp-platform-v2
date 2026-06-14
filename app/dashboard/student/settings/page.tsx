import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "../LogOutButton";
import ChangePasswordForm from "./ChangePasswordForm";
import SubscriptionCard from "./SubscriptionCard";
import { Settings } from "lucide-react";

export default async function StudentSettingsPage() {
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

  const isAllowedRole = profile?.role === "student" || profile?.role === "parent";
  if (!profile || !isAllowedRole || profile.status !== "active") {
    redirect("/login");
  }

  let subscriptionStatus: string | null = null;

  if (profile.role === "parent") {
    const { data: parentRow } = await supabase
      .from("parents")
      .select("student_id")
      .eq("profile_id", user.id)
      .single();

    if (parentRow) {
      const { data: studentData } = await supabase
        .from("students")
        .select("subscription_status")
        .eq("id", parentRow.student_id)
        .single();
      subscriptionStatus = studentData?.subscription_status ?? null;
    }
  } else {
    const { data: studentData } = await supabase
      .from("students")
      .select("subscription_status")
      .eq("profile_id", user.id)
      .single();
    subscriptionStatus = studentData?.subscription_status ?? null;
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            href="/dashboard/student"
            className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/student/settings"
              className="flex items-center gap-1 text-sm text-[#d93025] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <LogOutButton />
          </div>
        </div>
      </nav>

      <div className="px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h1 className="text-2xl font-bold text-[#0f172a]">Account Settings</h1>
          <p className="text-[#64748b] text-sm md:text-base mb-6">
            Manage your password and subscription preferences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <ChangePasswordForm />
            <SubscriptionCard subscriptionStatus={subscriptionStatus} />
          </div>
        </div>
      </div>
    </>
  );
}
