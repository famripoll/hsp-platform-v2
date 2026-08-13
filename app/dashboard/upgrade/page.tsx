import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import UpgradeOptions from "./UpgradeOptions";

export default async function UpgradePage() {
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

  let studentId: string | null = null;
  let studentFullName: string | null = null;
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
        .select("id, full_name, subscription_status")
        .eq("id", parentRow.student_id)
        .single();
      studentId = studentData?.id ?? null;
      studentFullName = studentData?.full_name ?? null;
      subscriptionStatus = studentData?.subscription_status ?? null;
    }
  } else {
    const { data: studentData } = await supabase
      .from("students")
      .select("id, full_name, subscription_status")
      .eq("profile_id", user.id)
      .single();
    studentId = studentData?.id ?? null;
    studentFullName = studentData?.full_name ?? null;
    subscriptionStatus = studentData?.subscription_status ?? null;
  }

  if (subscriptionStatus === "paid") {
    redirect("/dashboard/student");
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div className="flex items-center justify-between gap-3 sm:block">
            <h1 className="text-2xl font-bold text-[#0f172a]">
              {profile.role === "parent" ? "Choose a plan" : "Payment plan required"}
            </h1>
            <Link
              href="/dashboard/student"
              className="sm:hidden border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-6 py-1.5 hover:bg-red-50 transition-colors shrink-0 w-fit"
            >
              Back
            </Link>
          </div>
          <Link
            href="/dashboard/student"
            className="hidden sm:block border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-6 py-1.5 hover:bg-red-50 transition-colors shrink-0 w-fit"
          >
            Back
          </Link>
        </div>

        {profile.role === "student" ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <p className="text-[#64748b] text-sm md:text-base max-w-md">
              Please contact your Parent/Guardian to select a payment plan.
            </p>
          </div>
        ) : (
          <UpgradeOptions
            studentFirstName={(studentFullName ?? "your student").split(" ")[0]}
            studentId={studentId ?? ""}
            parentProfileId={user.id}
            userEmail={profile.email ?? ""}
          />
        )}
      </div>
    </div>
  );
}
