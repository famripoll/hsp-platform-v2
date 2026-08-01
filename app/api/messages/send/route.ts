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
    const { studentId, body } = await request.json();

    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json({ error: "Missing studentId." }, { status: 400 });
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

    if (!profile || profile.role !== "coach") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: coachRow } = await supabase
      .from("coaches")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!coachRow) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { error: insertError } = await supabaseAdmin.from("messages").insert({
      coach_id: coachRow.id,
      student_id: studentId,
      sender_role: "coach",
      body: trimmedBody,
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    const { data: studentRow } = await supabaseAdmin
      .from("students")
      .select("profile_id")
      .eq("id", studentId)
      .single();

    const { data: parentRows } = await supabaseAdmin
      .from("parents")
      .select("profile_id")
      .eq("student_id", studentId);

    const parentProfileIds = (parentRows ?? []).map((row) => row.profile_id);

    const recipientProfileIds = Array.from(
      new Set(
        [studentRow?.profile_id, ...parentProfileIds].filter(
          (id): id is string => Boolean(id)
        )
      )
    );

    if (recipientProfileIds.length > 0) {
      const notifications = recipientProfileIds.map((recipientId) => ({
        user_id: recipientId,
        type: "new_message",
        title: "New message from a college coach",
        body: "A college coach sent you a message. Log in to read it.",
        link_url: `/dashboard/student?tab=messages&coach=${coachRow.id}`,
      }));

      await supabaseAdmin.from("notifications").insert(notifications);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
