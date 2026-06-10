import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import LogOutButton from "../student/LogOutButton";
import {
  Bell,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Settings,
  Star,
} from "lucide-react";

type Coach = {
  university?: string | null;
  division?: string | null;
  state?: string | null;
  phone?: string | null;
  verified?: boolean | null;
};

const FALLBACK = "Not provided";

export default async function CoachDashboardPage() {
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

  if (
    !profile ||
    profile.role !== "coach" ||
    (profile.status !== "active" && profile.status !== "pending")
  ) {
    redirect("/login");
  }

  const { data: coachRaw } = await supabase
    .from("coaches")
    .select("university, division, state, phone, verified")
    .eq("profile_id", user.id)
    .single();

  const coach = (coachRaw ?? {}) as Coach;
  const isVerified = coach.verified === true;

  const featureCards = [
    {
      title: "Prospect Search",
      description: "Search tools will appear here when coach discovery is ready.",
      icon: Search,
    },
    {
      title: "Watchlist",
      description: "Saved prospects and follow-up lists will appear here.",
      icon: Star,
    },
    {
      title: "Messages",
      description: "Coach messaging will appear here in a future release.",
      icon: MessageSquare,
    },
    {
      title: "Notifications",
      description: "Recruiting alerts and account updates will appear here.",
      icon: Bell,
    },
  ];

  return (
    <>
      {/* Dashboard Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link
            href="/dashboard/coach"
            className="flex items-baseline gap-1 font-black text-xl sm:text-2xl md:text-3xl leading-none hover:opacity-80 hover:scale-105 transition-all duration-200 shrink-0"
          >
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/coach/settings"
              className="flex items-center gap-1 text-sm text-[#0f172a] hover:text-[#d93025] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <LogOutButton />
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Coach Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p
                    className="text-xs font-semibold uppercase mb-1.5"
                    style={{ color: "#d93025" }}
                  >
                    Coach Profile
                  </p>
                  <h1 className="text-2xl font-bold leading-tight" style={{ color: "#0f172a" }}>
                    {profile.full_name ?? FALLBACK}
                  </h1>
                </div>
                <span
                  className="text-xs rounded-full px-3 py-1 font-semibold whitespace-nowrap"
                  style={{
                    backgroundColor: isVerified ? "#dcfce7" : "#F2F3F3",
                    color: isVerified ? "#166534" : "#0f172a",
                  }}
                >
                  {isVerified ? "Verified" : "Pending Verification"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-5">
                <div className="rounded-xl p-3" style={{ backgroundColor: "#F2F3F3" }}>
                  <p
                    className="text-[10px] font-semibold uppercase mb-1"
                    style={{ color: "#64748b" }}
                  >
                    University
                  </p>
                  <div className="flex items-start gap-2">
                    <GraduationCap
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: "#64748b" }}
                    />
                    <span className="text-sm font-semibold leading-tight" style={{ color: "#0f172a" }}>
                      {coach.university ?? FALLBACK}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F2F3F3" }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: "#64748b" }}
                    >
                      Division
                    </p>
                    <span className="text-sm font-semibold leading-tight" style={{ color: "#0f172a" }}>
                      {coach.division ?? FALLBACK}
                    </span>
                  </div>
                  <div className="rounded-xl p-3" style={{ backgroundColor: "#F2F3F3" }}>
                    <p
                      className="text-[10px] font-semibold uppercase mb-1"
                      style={{ color: "#64748b" }}
                    >
                      State
                    </p>
                    <div className="flex items-start gap-1">
                      <MapPin
                        className="w-3 h-3 shrink-0 mt-0.5"
                        style={{ color: "#64748b" }}
                      />
                      <span className="text-sm font-semibold leading-tight" style={{ color: "#0f172a" }}>
                        {coach.state ?? FALLBACK}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="border-t border-gray-100 pt-4">
                  <p
                    className="text-xs font-semibold uppercase mb-1.5"
                    style={{ color: "#d93025" }}
                  >
                    Contact
                  </p>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{profile.email ?? FALLBACK}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1" style={{ color: "#64748b" }}>
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{coach.phone || FALLBACK}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Future Coach Features */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5" style={{ color: "#d93025" }} />
                    <h2 className="text-xl font-bold" style={{ color: "#0f172a" }}>
                      {card.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
