import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
});

type Plan = "silver" | "gold";
type Frequency = "monthly" | "6months" | "annual";

const PRICE_MAP: Record<Plan, Record<Frequency, string>> = {
  silver: {
    monthly: "price_1U4AEdEqzeZZAr9kMxuEopSX",
    "6months": "price_1U4AG5EqzeZZAr9kvwRzIYqd",
    annual: "price_1U4AGdEqzeZZAr9k6tUMetHP",
  },
  gold: {
    monthly: "price_1U4AHZEqzeZZAr9ks4Xj8QOd",
    "6months": "price_1U4AIEEqzeZZAr9kAGz6MaGb",
    annual: "price_1U4AIeEqzeZZAr9kM7fM5i1g",
  },
};

function isPlan(value: unknown): value is Plan {
  return value === "silver" || value === "gold";
}

function isFrequency(value: unknown): value is Frequency {
  return value === "monthly" || value === "6months" || value === "annual";
}

export async function POST(request: NextRequest) {
  try {
    const { plan, frequency, studentId, parentProfileId, userEmail } = await request.json();

    if (!isPlan(plan) || !isFrequency(frequency)) {
      return NextResponse.json({ error: "Invalid plan or frequency." }, { status: 400 });
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
