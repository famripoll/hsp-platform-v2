import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import EditProfileForm from "./EditProfileForm";

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
      <EditProfileForm
        initialFullName={editFullName}
        initialData={student ?? {}}
        userId={editUserId}
      />
    </>
  );
}
