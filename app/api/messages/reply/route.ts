import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_BODY_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const { coachId, body } = await request.json();

    if (!coachId || typeof coachId !== "string") {
      return NextResponse.json({ error: "Missing coachId." }, { status: 400 });
    }

    const trimmedBody = typeof body === "string" ? body.trim() : "";
    if (!trimmedBody || trimmedBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ error: "Message must be between 1 and 2000 characters." }, { status: 400 });
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

    if (!profile || profile.role !== "student") {
      if (profile?.role === "parent") {
        return NextResponse.json({ error: "Parents cannot send messages." }, { status: 403 });
      }
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: studentRow } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!studentRow) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { error: insertError } = await supabaseAdmin.from("messages").insert({
      coach_id: coachId,
      student_id: studentRow.id,
      sender_role: "student",
      body: trimmedBody,
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    const { data: coachRow } = await supabaseAdmin
      .from("coaches")
      .select("profile_id")
      .eq("id", coachId)
      .single();

    if (coachRow?.profile_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: coachRow.profile_id,
        type: "new_message",
        title: "New reply from a prospect",
        body: "A prospect replied to your message. Log in to read it.",
        link_url: "/dashboard/coach?tab=messages",
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
