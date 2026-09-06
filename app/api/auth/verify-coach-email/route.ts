import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ status: "invalid" });
  }

  if (!UUID_RE.test(token)) {
    return NextResponse.json({ status: "invalid" });
  }

  const { data: verification, error: selectError } = await supabaseAdmin
    .from("coach_email_verification")
    .select("id, profile_id, verified_at, sent_at")
    .eq("token", token)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ status: "error" });
  }

  if (!verification) {
    return NextResponse.json({ status: "invalid" });
  }

  if (verification.verified_at) {
    return NextResponse.json({ status: "already" });
  }

  if (verification.sent_at) {
    const sentAt = new Date(verification.sent_at).getTime();
    if (Date.now() - sentAt > EXPIRY_MS) {
      return NextResponse.json({ status: "expired" });
    }
  }

  const { error: verifyUpdateError } = await supabaseAdmin
    .from("coach_email_verification")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", verification.id);

  if (verifyUpdateError) {
    return NextResponse.json({ status: "error" });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("email, full_name")
    .eq("id", verification.profile_id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ status: "error" });
  }

  const email = profile?.email;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ status: "success" });
  }

  const firstName = (profile?.full_name ?? "").trim().split(/\s+/)[0] || "there";

  const sendActivationEmail = () =>
    sendEmail({
      to: email,
      subject: "Your coach account is active",
      html: renderEmail({
        preheader: "You now have access to the High School Prospect coach dashboard.",
        firstName,
        headline: "Your coach account is active",
        subline: "You now have access to the High School Prospect coach dashboard, where you can search prospects and message student-athletes.",
        ctaLabel: "Go to Dashboard",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      }),
    });

  const { data: staff, error: staffError } = await supabaseAdmin
    .from("program_staff")
    .select("id")
    .eq("email", email.toLowerCase())
    .limit(2);

  if (staffError) {
    return NextResponse.json({ status: "error" });
  }

  if (staff && staff.length === 1) {
    await supabaseAdmin
      .from("coaches")
      .update({
        verified: true,
        verification_method: "program_staff_match",
        program_staff_id: staff[0].id,
      })
      .eq("profile_id", verification.profile_id);

    await sendActivationEmail();

    return NextResponse.json({ status: "success" });
  }

  if (staff && staff.length > 1) {
    await supabaseAdmin
      .from("coaches")
      .update({
        verified: true,
        verification_method: "domain_match",
      })
      .eq("profile_id", verification.profile_id);

    await sendActivationEmail();

    return NextResponse.json({ status: "success" });
  }

  const domain = email.split("@")[1]?.toLowerCase();

  if (domain) {
    const { data: universities, error: universityError } = await supabaseAdmin
      .from("universities")
      .select("unitid")
      .eq("email_domain", domain)
      .limit(1);

    if (universityError) {
      return NextResponse.json({ status: "error" });
    }

    if (universities && universities.length > 0) {
      await supabaseAdmin
        .from("coaches")
        .update({
          verified: true,
          verification_method: "domain_match",
        })
        .eq("profile_id", verification.profile_id);

      await sendActivationEmail();

      return NextResponse.json({ status: "success" });
    }
  }

  await supabaseAdmin
    .from("coaches")
    .update({ verification_method: "manual" })
    .eq("profile_id", verification.profile_id);

  return NextResponse.json({ status: "success" });
}
