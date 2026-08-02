import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const THROTTLE_MS = 60 * 1000;

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data: rows, error: selectError } = await supabaseAdmin
    .from("students")
    .select("id, email, full_name, email_verified_at, email_verification_sent_at")
    .eq("profile_id", user.id);

  if (selectError) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const student = rows[0];

  if (student.email_verified_at) {
    return NextResponse.json({ status: "already_verified" });
  }

  if (student.email_verification_sent_at) {
    const sentAt = new Date(student.email_verification_sent_at).getTime();
    if (Date.now() - sentAt < THROTTLE_MS) {
      return NextResponse.json(
        { error: "Please wait a moment before requesting another email." },
        { status: 429 }
      );
    }
  }

  const verificationToken = crypto.randomUUID();

  const { error: updateError } = await supabaseAdmin
    .from("students")
    .update({
      email_verification_token: verificationToken,
      email_verification_sent_at: new Date().toISOString(),
    })
    .eq("id", student.id);

  if (updateError) {
    return NextResponse.json({ error: "Could not send email." }, { status: 500 });
  }

  const studentFirstName = student.full_name?.trim().split(/\s+/)[0] || "there";

  await sendEmail({
    to: student.email,
    subject: "Confirm your email — High School Prospect",
    html: renderEmail({
      preheader: "Confirm your email address.",
      firstName: studentFirstName,
      headline: "Confirm your email address.",
      subline: "Tap the button below to confirm this is the right email for your account.",
      ctaLabel: "Verify my email",
      ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
    }),
  });

  return NextResponse.json({ status: "sent" });
}
