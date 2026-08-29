import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import CollegeSearchClient from "./CollegeSearchClient";

export default async function CollegesPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const isAllowedRole = profile?.role === "student" || profile?.role === "parent";
  if (!profile || !isAllowedRole || profile.status !== "active") {
    redirect("/login");
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6">
      <CollegeSearchClient />
    </div>
  );
}
