import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const { error: profileError } = await supabase.from("profiles").insert({
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
    const { error: studentError } = await supabase.from("students").insert({
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
    });

    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
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
          try {
            const resendResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "High School Prospect <noreply@highschoolprospect.com>",
                to: [parent_email],
                subject: "Your child created an HSP account",
                html: `
                  <p>Hi ${parent_name},</p>
                  <p><strong>${full_name}</strong> has created a profile on
                  High School Prospect.</p>
                  <p>To access your parent account and view their profile,
                  click the link below:</p>
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/login">
                  Access My Account</a></p>
                  <p>On the login page, enter your email address and the system
                  will send you a secure access code.</p>
                  <p>— The High School Prospect Team</p>
                `,
              }),
            });

            if (!resendResponse.ok) {
              console.warn("[signup] Resend activation email failed:", await resendResponse.text());
            }
          } catch (resendError) {
            console.warn("[signup] Resend activation email error:", resendError);
          }
        }
      }
    }
  }

  if (role === "parent") {
    const { error: parentError } = await supabase.from("parents").insert({
      profile_id: authData.user.id,
      student_id: student!.id,
      relationship,
    });

    if (parentError) {
      return NextResponse.json({ error: parentError.message }, { status: 500 });
    }
  }

  if (role === "coach") {
    const { error: coachError } = await supabase.from("coaches").insert({
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
