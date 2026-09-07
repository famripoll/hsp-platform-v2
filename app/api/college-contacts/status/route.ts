import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";
import { computeCycleStart, PLAN_LIMITS } from "@/lib/collegeContactQuota";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cycle start plus one month, clamped to the anchor day-of-month the same way
// computeCycleStart clamps it, so a subscription anchored on the 31st resolves
// correctly in short months.
function computeNextResetAt(cycleStart: Date, subscriptionCreatedAt: string): Date {
  const anchorDay = new Date(subscriptionCreatedAt).getUTCDate();

  let year = cycleStart.getUTCFullYear();
  let month = cycleStart.getUTCMonth() + 1;
  if (month > 11) {
    month = 0;
    year += 1;
  }

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(anchorDay, daysInMonth);

  return new Date(Date.UTC(year, month, day));
}

export async function GET() {
  try {
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
      .maybeSingle();

    if (!profile || (profile.role !== "student" && profile.role !== "parent")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    let student: { id: string; profile_id: string } | null = null;

    if (profile.role === "student") {
      const { data } = await supabase
        .from("students")
        .select("id, profile_id")
        .eq("profile_id", user.id)
        .maybeSingle();
      student = data;
    } else {
      const { data: parent } = await supabase
        .from("parents")
        .select("student_id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!parent) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }

      const { data } = await supabase
        .from("students")
        .select("id, profile_id")
        .eq("id", parent.student_id)
        .maybeSingle();
      student = data;
    }

    if (!student) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { count: photoCount } = await supabaseAdmin
      .from("student_media")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", student.profile_id)
      .eq("media_type", "photo");

    const { count: videoCount } = await supabaseAdmin
      .from("student_media")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", student.profile_id)
      .eq("media_type", "video");

    const hasPhoto = (photoCount ?? 0) >= 1;
    const hasVideo = (videoCount ?? 0) >= 1;

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, created_at")
      .eq("student_id", student.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({
        hasActiveSubscription: false,
        plan: null,
        limit: 0,
        used: 0,
        remaining: 0,
        cycleStart: null,
        nextResetAt: null,
        hasPhoto,
        hasVideo,
      });
    }

    const limit = PLAN_LIMITS[subscription.plan as string];
    if (!limit) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 403 });
    }

    const cycleStart = computeCycleStart(subscription.created_at);
    const cycleStartIso = cycleStart.toISOString();
    const nextResetAt = computeNextResetAt(cycleStart, subscription.created_at);

    const { count: contactCount } = await supabaseAdmin
      .from("college_contacts")
      .select("*", { count: "exact", head: true })
      .eq("student_id", student.id)
      .gte("created_at", cycleStartIso);

    const used = contactCount ?? 0;
    const remaining = Math.max(limit - used, 0);

    return NextResponse.json({
      hasActiveSubscription: true,
      plan: subscription.plan ?? null,
      limit,
      used,
      remaining,
      cycleStart: cycleStartIso,
      nextResetAt: nextResetAt.toISOString(),
      hasPhoto,
      hasVideo,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
