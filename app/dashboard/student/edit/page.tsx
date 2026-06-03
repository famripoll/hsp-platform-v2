import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "../LogOutButton";
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

  if (!profile || profile.role !== "student" || profile.status !== "active") {
    redirect("/login");
  }

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  return (
    <>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-baseline gap-1 font-black text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-medium hidden sm:inline"
              style={{ color: "#0f172a" }}
            >
              {profile.full_name ?? ""}
            </span>
            <LogOutButton />
          </div>
        </div>
      </nav>

      <EditProfileForm
        initialFullName={profile.full_name ?? ""}
        initialData={student ?? {}}
        userId={user.id}
      />
    </>
  );
}
