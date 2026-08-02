import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const { data: rows, error: selectError } = await supabaseAdmin
    .from("students")
    .select("id, email_verified_at, email_verification_sent_at")
    .eq("email_verification_token", token);

  if (selectError) {
    return NextResponse.json({ status: "error" });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ status: "invalid" });
  }

  const student = rows[0];

  if (student.email_verified_at) {
    return NextResponse.json({ status: "already" });
  }

  if (student.email_verification_sent_at) {
    const sentAt = new Date(student.email_verification_sent_at).getTime();
    if (Date.now() - sentAt > EXPIRY_MS) {
      return NextResponse.json({ status: "expired" });
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("students")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", student.id);

  if (updateError) {
    return NextResponse.json({ status: "error" });
  }

  return NextResponse.json({ status: "success" });
}
