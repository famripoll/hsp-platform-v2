import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_COACH_IDS = 50;

export async function POST(request: NextRequest) {
  try {
    const { coachIds } = await request.json();

    if (
      !Array.isArray(coachIds) ||
      coachIds.length === 0 ||
      coachIds.length > MAX_COACH_IDS ||
      !coachIds.every((id) => typeof id === "string")
    ) {
      return NextResponse.json({ error: "Invalid coachIds." }, { status: 400 });
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "student" && profile.role !== "parent")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: coachRows, error: coachError } = await supabaseAdmin
      .from("coaches")
      .select("id, university, profile_id")
      .in("id", coachIds);

    if (coachError) {
      return NextResponse.json({ error: "Failed to load coach info." }, { status: 500 });
    }

    const coaches = coachRows ?? [];

    const profileIds = coaches
      .map((c) => c.profile_id)
      .filter((id): id is string => Boolean(id));

    let nameByProfileId: Record<string, string> = {};
    if (profileIds.length > 0) {
      const { data: profileRows, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);

      if (profileError) {
        return NextResponse.json({ error: "Failed to load coach info." }, { status: 500 });
      }

      nameByProfileId = Object.fromEntries(
        (profileRows ?? []).map((p) => [p.id, p.full_name ?? "College Coach"])
      );
    }

    const result = coaches.map((c) => ({
      id: c.id,
      fullName: (c.profile_id ? nameByProfileId[c.profile_id] : null) ?? "College Coach",
      university: c.university ?? null,
    }));

    return NextResponse.json({ coaches: result });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
