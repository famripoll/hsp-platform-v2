import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import ChangePasswordForm from "./ChangePasswordForm";

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
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Account Settings</h1>

        <div className="flex flex-col gap-6">
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
