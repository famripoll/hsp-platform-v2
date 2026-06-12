import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "../LogOutButton";
import EditProfileForm from "./EditProfileForm";
import { Settings } from "lucide-react";

export default async function StudentEditPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, full_name, email")
    .eq("id", user.id)
    .single();

  const isAllowedRole = profile?.role === "student" || profile?.role === "parent";
  if (!profile || !isAllowedRole || profile.status !== "active") {
    redirect("/login");
  }

  const isParent = profile.role === "parent";
  let student: Record<string, unknown> | null = null;
  let editUserId = user.id;
  let editFullName = profile.full_name ?? "";

  if (isParent) {
    const { data: parentRow } = await supabase
      .from("parents")
      .select("student_id")
      .eq("profile_id", user.id)
      .single();

    if (!parentRow) redirect("/login");

    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("id", parentRow.student_id)
      .single();

    student = studentData;

    if (studentData?.profile_id) {
      editUserId = studentData.profile_id as string;

      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", studentData.profile_id)
        .single();

      editFullName = studentProfile?.full_name ?? "";
    }
  } else {
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    student = studentData;
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <span className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none cursor-pointer transition-transform duration-200 hover:scale-105 shrink-0">
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/student/settings"
              className="flex items-center gap-1 text-sm text-[#0f172a] hover:text-[#d93025] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <LogOutButton />
          </div>
        </div>
      </nav>

      <EditProfileForm
        initialFullName={editFullName}
        initialData={student ?? {}}
        userId={editUserId}
      />
    </>
  );
}
