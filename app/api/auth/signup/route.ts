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
  console.log("[signup] received:", { email, full_name, role });

  if (!email || !password || !full_name || !role) {
    console.log("[signup] missing fields");
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let student: { id: string } | null = null;

  if (role === "parent") {
    const { data: studentData, error: studentLookupError } = await supabase
      .from("students")
      .select("id")
      .eq("email", athlete_email)
      .single();
    console.log("[signup] student lookup:", { studentData, studentLookupError });

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
    console.log("[signup] existing parent lookup:", { existingParent, parentLookupError });

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
  console.log("[signup] auth.signUp result:", { userId: authData?.user?.id, authError });

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
  console.log("[signup] profiles.insert error:", profileError);

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
    console.log("[signup] students.insert error:", studentError);

    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }

    // Auto-create parent auth account
    const { data: studentRow } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", authData.user.id)
      .single();
    console.log("Student ID found:", studentRow?.id);

    if (studentRow && parent_email && parent_name) {
      const tempPassword = crypto.randomUUID();
      const parentAuthUser = await supabaseAdmin.auth.admin.createUser({
        email: parent_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: parent_name, role: "parent" },
      });
      const { data: parentAuthData, error: parentAuthError } = parentAuthUser;
      console.log("[signup] parent auth.admin.createUser:", { userId: parentAuthData?.user?.id, parentAuthError });

      if (parentAuthData?.user && !parentAuthError) {
        console.log("Parent auth user created:", parentAuthUser.data?.user?.id);
        console.log("Parent temp password:", tempPassword);

        const profileInsert = await supabaseAdmin.from("profiles").insert({
          id: parentAuthData.user.id,
          email: parent_email,
          full_name: parent_name,
          role: "parent",
          status: "active",
        });
        console.log("Parent profile insert result:", profileInsert);

        console.log("Inserting into parents table with:", { profile_id: parentAuthData.user.id, student_id: studentRow.id });
        const parentsInsert = await supabaseAdmin.from("parents").insert({
          profile_id: parentAuthData.user.id,
          student_id: studentRow.id,
          relationship: parent_relationship || "Guardian",
        });
        console.log("Parents table insert result:", parentsInsert);
      }
    }
  }

  if (role === "parent") {
    const { error: parentError } = await supabase.from("parents").insert({
      profile_id: authData.user.id,
      student_id: student!.id,
      relationship,
    });
    console.log("[signup] parents.insert error:", parentError);

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
    console.log("[signup] coaches.insert error:", coachError);

    if (coachError) {
      return NextResponse.json({ error: coachError.message }, { status: 500 });
    }
  }

  console.log("[signup] success for:", email);
  return NextResponse.json({ success: true });
}
