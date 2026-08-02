import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_EMAIL_CHANGES = 3;

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

  const { email } = await request.json();

  const newEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(newEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { data: rows, error: selectError } = await supabaseAdmin
    .from("students")
    .select("id, email, full_name, email_verified_at, email_change_count")
    .eq("profile_id", user.id);

  if (selectError) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const student = rows[0];

  if (student.email_verified_at) {
    return NextResponse.json({ error: "This email is already verified." }, { status: 403 });
  }

  if (student.email_change_count >= MAX_EMAIL_CHANGES) {
    return NextResponse.json(
      { error: "You've changed your email too many times. Please contact support." },
      { status: 429 }
    );
  }

  if (student.email?.trim().toLowerCase() === newEmail) {
    return NextResponse.json(
      { error: "That's the same address already on your account." },
      { status: 400 }
    );
  }

  const { data: existingProfiles, error: existingProfilesError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", newEmail);

  if (existingProfilesError) {
    return NextResponse.json({ error: "Could not update your email. Please try again." }, { status: 500 });
  }

  if ((existingProfiles ?? []).some((row) => row.id !== user.id)) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
  }

  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email: newEmail,
    email_confirm: true,
  });

  if (authUpdateError) {
    return NextResponse.json({ error: "Could not update your email. Please try again." }, { status: 500 });
  }

  const { error: profileUpdateError } = await supabaseAdmin
    .from("profiles")
    .update({ email: newEmail })
    .eq("id", user.id);

  if (profileUpdateError) {
    return NextResponse.json({ error: "Could not update your email. Please try again." }, { status: 500 });
  }

  const verificationToken = crypto.randomUUID();

  const { error: studentUpdateError } = await supabaseAdmin
    .from("students")
    .update({
      email: newEmail,
      email_verification_token: verificationToken,
      email_verification_sent_at: new Date().toISOString(),
      email_verified_at: null,
      email_change_count: student.email_change_count + 1,
    })
    .eq("id", student.id);

  if (studentUpdateError) {
    return NextResponse.json({ error: "Could not update your email. Please try again." }, { status: 500 });
  }

  const studentFirstName = student.full_name?.trim().split(/\s+/)[0] || "there";

  await sendEmail({
    to: newEmail,
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

  return NextResponse.json({ status: "updated", email: newEmail });
}
