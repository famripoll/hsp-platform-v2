import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

export default async function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "coach") {
    redirect("/login");
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("verified")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!coach || coach.verified !== true) {
    redirect("/login");
  }

  return <>{children}</>;
}
