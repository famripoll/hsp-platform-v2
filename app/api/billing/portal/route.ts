// Placeholder — replace this handler with real Lemon Squeezy customer portal
// session creation during the Lemon Squeezy integration step. The endpoint
// should create a portal session via the LS API and return { url } pointing
// to the customer portal URL so the client can redirect there.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Billing management isn't available yet. Please check back soon." },
    { status: 501 }
  );
}
