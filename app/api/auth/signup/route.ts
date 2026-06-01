import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const { email, password, full_name, role, high_school, city, state, grade, parent_email } = await request.json();
  console.log("[signup] received:", { email, full_name, role });

  if (!email || !password || !full_name || !role) {
    console.log("[signup] missing fields");
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  console.log("[signup] auth.signUp result:", { userId: authData?.user?.id, authError });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Sign up failed." }, { status: 400 });
  }

  const status = role === "parent" ? "active" : "pending";

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
      high_school,
      city,
      state,
      grade,
      parent_email,
    });
    console.log("[signup] students.insert error:", studentError);

    if (studentError) {
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }
  }

  console.log("[signup] success for:", email);
  return NextResponse.json({ success: true });
}
