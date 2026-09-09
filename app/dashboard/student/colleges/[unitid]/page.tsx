import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import type { University } from "@/lib/types";
import { Users } from "lucide-react";
import CollegeHero from "./CollegeHero";
import CollegeStatsCard from "./CollegeStatsCard";
import BackToSearchLink from "./BackToSearchLink";
import ContactCollegeButton from "./ContactCollegeButton";

type ProgramStaffPublic = {
  id: string;
  unitid: number;
  institution_name: string | null;
  first_name: string;
  last_name: string | null;
  title_txt: string | null;
};

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ unitid: string }>;
}) {
  const { unitid } = await params;
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

  const { data: universityData } = await supabase
    .from("universities")
    .select("*")
    .eq("unitid", Number(unitid))
    .single();

  const { data: staffData } = await supabase
    .from("program_staff_public")
    .select("id, unitid, institution_name, first_name, last_name, title_txt")
    .eq("unitid", Number(unitid))
    .order("last_name", { ascending: true });

  const coaches = (staffData ?? []) as ProgramStaffPublic[];

  const university = universityData as University | null;

  if (!university) {
    redirect("/dashboard/student/colleges");
  }

  const mapAddress = [
    university.address_txt,
    university.city_txt,
    university.state_cd,
    university.zip_txt,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    // pb-24 keeps the last stat card clear of the floating BackToTopButton
    // (fixed bottom-6 right-6, h-12).
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 pb-24">
      <BackToSearchLink />

      {/* Hero band + collapsible map — a client component so the "View on map"
          link and the map's own toggle can share open state (this page is a
          Server Component and can't hold it). */}
      <CollegeHero university={university} mapAddress={mapAddress} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Column 1: one merged stats card, collapsible on mobile (client
            component — page.tsx is a Server Component for the auth guard). */}
        <CollegeStatsCard university={university} />

        <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" style={{ color: "#d93025" }} />
            <h3 className="text-xl font-bold" style={{ color: "#0f172a" }}>
              Baseball Program Contact
            </h3>
          </div>
          {coaches.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Users className="w-10 h-10" style={{ color: "#d1d5db" }} />
              <p className="text-sm text-center" style={{ color: "#5A6779" }}>
                Coach information coming soon
              </p>
              <ContactCollegeButton
                unitid={Number(unitid)}
                institutionName={university.institution_name}
                hasCoaches={coaches.length > 0}
                isParentViewer={profile.role === "parent"}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col divide-y divide-gray-100">
                {coaches.map((coach) => {
                  const fullName = `${coach.first_name} ${coach.last_name ?? ""}`.trim();
                  const title = coach.title_txt ? coach.title_txt : "Coach";
                  return (
                    <div key={coach.id} className="py-3 first:pt-0">
                      <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                        {fullName}
                      </p>
                      <p className="text-sm" style={{ color: "#5A6779" }}>
                        {title}
                      </p>
                    </div>
                  );
                })}
              </div>
              <ContactCollegeButton
                unitid={Number(unitid)}
                institutionName={university.institution_name}
                hasCoaches={coaches.length > 0}
                isParentViewer={profile.role === "parent"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
