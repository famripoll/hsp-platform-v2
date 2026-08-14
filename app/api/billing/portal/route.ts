import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
});

export async function POST() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let studentId: string | null = null;

  if (profile?.role === "parent") {
    const { data: parentRow } = await supabase
      .from("parents")
      .select("student_id")
      .eq("profile_id", user.id)
      .single();

    studentId = parentRow?.student_id ?? null;
  } else if (profile?.role === "student") {
    const { data: studentRow } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    studentId = studentRow?.id ?? null;
  }

  if (!studentId) {
    return NextResponse.json({ error: "Unable to resolve account." }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
