import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { email, password, full_name, role, high_school, city, state, grade, graduation_year, parent_email, parent_name, parent_phone, parent_relationship, athlete_email, relationship, phone, university, division } = await request.json();

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let student: { id: string } | null = null;

  if (role === "parent") {
    const { data: studentData, error: studentLookupError } = await supabase
      .from("students")
      .select("id")
      .eq("email", athlete_email)
      .single();

    if (studentLookupError || !studentData) {
      return NextResponse.json(
        { error: "No athlete account found. Please ask your athlete to register first." },
        { status: 404 }
      );
    }

    student = studentData;

    const { data: existingParent, error: parentLookupError } = await supabase
      .from("parents")
      .select("id")
      .eq("student_id", student.id)
      .single();

    if (existingParent) {
      return NextResponse.json(
        { error: "A parent account is already linked to this athlete. Only one parent account is allowed per athlete." },
        { status: 400 }
      );
    }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Sign up failed." }, { status: 400 });
  }

  const status = role === "coach" ? "pending" : "active";

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    email,
    full_name,
    role,
    status,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (role === "student") {
    const verificationToken = crypto.randomUUID();

    const { error: studentError } = await supabaseAdmin.from("students").insert({
      profile_id: authData.user.id,
      email,
      full_name,
      high_school,
      city,
      state,
      grade,
      graduation_year,
      parent_email,
      parent_name,
      parent_phone,
      parent_relationship,
      email_verification_token: verificationToken,
      email_verification_sent_at: new Date().toISOString(),
    });

    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    const studentFirstName = full_name.trim().split(/\s+/)[0] || "there";
    const welcomeSent = await sendEmail({
      to: email,
      subject: "Welcome to High School Prospect",
      html: renderEmail({
        preheader: "Confirm your email address to finish setting up your profile.",
        firstName: studentFirstName,
        headline: "Confirm your email to finish setting up your profile.",
        subline: "Tap the button below so we know we can reach you. It only takes a second.",
        ctaLabel: "Verify my email",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
        bulletsHeading: "Here's what you can do:",
        bullets: [
          "Bring your stats, video, and social links together in one complete profile",
          "Explore college programs across the United States",
          "Get discovered by college coaches looking for players like you",
        ],
        note: "Coaches verify what they see. Make sure your stats, GPA, and grad year are accurate — an honest profile is what earns their trust. We've also emailed your parent or guardian; some features unlock once they choose a plan.",
      }),
    });

    if (!welcomeSent) {
      console.warn("[signup] Welcome email failed.");
    }

    // Auto-create parent auth account
    const { data: studentRow } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", authData.user.id)
      .single();

    if (studentRow && parent_email && parent_name) {
      const tempPassword = crypto.randomUUID();
      const parentAuthUser = await supabaseAdmin.auth.admin.createUser({
        email: parent_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: parent_name, role: "parent" },
      });
      const { data: parentAuthData, error: parentAuthError } = parentAuthUser;

      if (parentAuthData?.user && !parentAuthError) {
        const profileInsert = await supabaseAdmin.from("profiles").insert({
          id: parentAuthData.user.id,
          email: parent_email,
          full_name: parent_name,
          role: "parent",
          status: "active",
        });

        const parentsInsert = await supabaseAdmin.from("parents").insert({
          profile_id: parentAuthData.user.id,
          student_id: studentRow.id,
          relationship: parent_relationship || "Guardian",
        });

        if (!parentsInsert.error) {
          const sent = await sendEmail({
            to: parent_email,
            subject: "Your child created an HSP account",
            html: renderEmail({
              preheader: "Your child created a profile on High School Prospect.",
              firstName: parent_name,
              headline: `${full_name} has created a profile on High School Prospect.`,
              subline: "Log in to view their profile.",
              ctaLabel: "Access my account",
              ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
              note: "On the login page, enter your email address and we'll send you a secure access code. You don't need a password.",
            }),
          });

          if (!sent) {
            console.warn("[signup] Resend activation email failed.");
          }
        }
      }
    }
  }

  if (role === "parent") {
    const { error: parentError } = await supabaseAdmin.from("parents").insert({
      profile_id: authData.user.id,
      student_id: student!.id,
      relationship,
    });

    if (parentError) {
      return NextResponse.json({ error: parentError.message }, { status: 500 });
    }
  }

  if (role === "coach") {
    const { error: coachError } = await supabaseAdmin.from("coaches").insert({
      profile_id: authData.user.id,
      university,
      division,
      state,
      verified: false,
      phone: phone ?? "",
    });

    if (coachError) {
      return NextResponse.json({ error: coachError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
