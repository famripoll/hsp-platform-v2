import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
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
      .maybeSingle();

    if (!profile || (profile.role !== "student" && profile.role !== "parent")) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    let student: { subscription_status: string | null } | null = null;

    if (profile.role === "parent") {
      const { data: parentRow } = await supabase
        .from("parents")
        .select("student_id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (parentRow) {
        const { data } = await supabase
          .from("students")
          .select("subscription_status")
          .eq("id", parentRow.student_id)
          .maybeSingle();
        student = data;
      }
    } else {
      const { data } = await supabase
        .from("students")
        .select("subscription_status")
        .eq("profile_id", user.id)
        .maybeSingle();
      student = data;
    }

    if (!student) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ status: student.subscription_status ?? "free" });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
