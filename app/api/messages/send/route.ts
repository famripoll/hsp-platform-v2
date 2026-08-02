import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

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
      .select("id, profile_id")
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
      .select("profile_id, full_name")
      .eq("id", studentId)
      .single();

    const studentFirstName = studentRow?.full_name?.trim().split(/\s+/)[0] || null;

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

    let coachFullName: string | null = null;
    if (coachRow.profile_id) {
      const { data: coachProfile } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", coachRow.profile_id)
        .single();
      coachFullName = coachProfile?.full_name ?? null;
    }

    const notificationTitle = coachFullName
      ? `New message from ${coachFullName}`
      : "New message from a college coach";

    if (recipientProfileIds.length > 0) {
      const notifications = recipientProfileIds.map((recipientId) => ({
        user_id: recipientId,
        type: "new_message",
        title: notificationTitle,
        body:
          recipientId === studentRow?.profile_id
            ? "A college coach sent you a message."
            : `A college coach sent ${studentFirstName || "your athlete"} a message.`,
        link_url: `/dashboard/student?tab=messages&coach=${coachRow.id}`,
      }));

      const { error: notificationsError } = await supabaseAdmin
        .from("notifications")
        .insert(notifications);

      if (!notificationsError) {
        const { data: recipientProfiles } = await supabaseAdmin
          .from("profiles")
          .select("id, email, full_name")
          .in("id", recipientProfileIds);

        await Promise.all(
          (recipientProfiles ?? [])
            .filter((recipient): recipient is { id: string; email: string; full_name: string | null } =>
              Boolean(recipient.email)
            )
            .map((recipient) => {
              const firstName = recipient.full_name?.split(" ")[0];
              const isStudent = recipient.id === studentRow?.profile_id;
              return sendEmail({
                to: recipient.email,
                subject: "New message on High School Prospect",
                html: renderEmail({
                  preheader: isStudent
                    ? "Log in to read your new message."
                    : "Log in to view the new message.",
                  firstName: firstName || "there",
                  headline: isStudent
                    ? "A college coach has sent you a message on High School Prospect."
                    : studentFirstName
                    ? `A college coach has sent ${studentFirstName} a message on High School Prospect.`
                    : "A college coach has sent you a message on High School Prospect.",
                  subline: "Log in to read it and reply.",
                  ctaLabel: "Log in to read",
                  ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
                  note: "For your safety, we never include message contents in email. All conversations stay on the platform, where a parent or guardian can review them.",
                }),
              });
            })
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
