import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase-server";
import { PRICE_MAP, type Plan, type Frequency } from "@/lib/stripePrices";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
});

function isPlan(value: unknown): value is Plan {
  return value === "silver" || value === "gold";
}

function isFrequency(value: unknown): value is Frequency {
  return value === "monthly" || value === "6months" || value === "annual";
}

export async function POST(request: NextRequest) {
  try {
    const { plan, frequency, studentId, parentProfileId, userEmail, autoRenewalConsent } =
      await request.json();

    if (!isPlan(plan) || !isFrequency(frequency)) {
      return NextResponse.json({ error: "Invalid plan or frequency." }, { status: 400 });
    }

    if (autoRenewalConsent !== true) {
      return NextResponse.json(
        { error: "Automatic renewal consent is required." },
        { status: 400 },
      );
    }

    if (typeof studentId !== "string" || !studentId) {
      return NextResponse.json({ error: "Missing studentId." }, { status: 400 });
    }

    if (typeof parentProfileId !== "string" || !parentProfileId) {
      return NextResponse.json({ error: "Missing parentProfileId." }, { status: 400 });
    }

    if (typeof userEmail !== "string" || !userEmail) {
      return NextResponse.json({ error: "Missing userEmail." }, { status: 400 });
    }

    const priceId = PRICE_MAP[plan][frequency];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan or frequency." }, { status: 400 });
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (parentProfileId !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "parent") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: parentRow } = await supabase
      .from("parents")
      .select("id")
      .eq("profile_id", user.id)
      .eq("student_id", studentId)
      .single();

    if (!parentRow) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade?checkout=canceled`,
      subscription_data: {
        metadata: {
          studentId,
          parentProfileId,
          plan,
          frequency,
          autoRenewalConsent: "true",
          autoRenewalConsentAt: new Date().toISOString(),
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Failed to create checkout session." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
