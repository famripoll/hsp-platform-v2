import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import SettingsTabs from "./SettingsTabs";

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
  let studentId: string | null = null;
  let parentName: string | null = null;
  let parentEmail: string | null = null;
  let parentPhone: string | null = null;
  let parentRelationship: string | null = null;
  let familyMembers: { id: string; full_name: string; relationship: string; email: string | null; phone: string | null; show_on_profile: boolean }[] = [];

  if (profile.role === "parent") {
    const { data: parentRow } = await supabase
      .from("parents")
      .select("student_id")
      .eq("profile_id", user.id)
      .single();

    if (parentRow) {
      const { data: studentData } = await supabase
        .from("students")
        .select("id, subscription_status, parent_name, parent_email, parent_phone, parent_relationship")
        .eq("id", parentRow.student_id)
        .single();
      subscriptionStatus = studentData?.subscription_status ?? null;
      studentId = studentData?.id ?? null;
      parentName = studentData?.parent_name ?? null;
      parentEmail = studentData?.parent_email ?? null;
      parentPhone = studentData?.parent_phone ?? null;
      parentRelationship = studentData?.parent_relationship ?? null;
    }
  } else {
    const { data: studentData } = await supabase
      .from("students")
      .select("id, subscription_status, parent_name, parent_email, parent_phone, parent_relationship")
      .eq("profile_id", user.id)
      .single();
    subscriptionStatus = studentData?.subscription_status ?? null;
    studentId = studentData?.id ?? null;
    parentName = studentData?.parent_name ?? null;
    parentEmail = studentData?.parent_email ?? null;
    parentPhone = studentData?.parent_phone ?? null;
    parentRelationship = studentData?.parent_relationship ?? null;
  }

  let subscriptionPlan: "silver" | "gold" | null = null;
  let billingFrequency: "monthly" | "6months" | "annual" | null = null;

  if (studentId) {
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("plan, billing_frequency, status")
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subData) {
      subscriptionPlan = subData.plan as "silver" | "gold";
      billingFrequency = subData.billing_frequency as "monthly" | "6months" | "annual";
    }

    const { data: familyData } = await supabase
      .from("family_members")
      .select("id, full_name, relationship, email, phone, show_on_profile")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });

    familyMembers = familyData ?? [];
  }

  return (
    <>
      <div className="px-4 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center justify-between gap-3 sm:block">
                <h1 className="text-2xl font-bold text-[#0f172a]">Account Settings</h1>
                <Link
                  href="/dashboard/student"
                  className="sm:hidden border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-6 py-1.5 hover:bg-red-50 transition-colors shrink-0 w-fit"
                >
                  Back
                </Link>
              </div>
              <p className="mt-2 sm:mt-0 text-[#64748b] text-sm md:text-base">
                Manage your password and subscription preferences.
              </p>
            </div>
            <Link
              href="/dashboard/student"
              className="hidden sm:block border border-[#d93025] text-[#d93025] font-semibold rounded-xl px-6 py-1.5 hover:bg-red-50 transition-colors shrink-0 w-fit"
            >
              Back
            </Link>
          </div>

          <SettingsTabs subscriptionStatus={subscriptionStatus} subscriptionPlan={subscriptionPlan} billingFrequency={billingFrequency} parentName={parentName} parentEmail={parentEmail} parentPhone={parentPhone} parentRelationship={parentRelationship} familyMembers={familyMembers} studentId={studentId} />
        </div>
      </div>
    </>
  );
}
