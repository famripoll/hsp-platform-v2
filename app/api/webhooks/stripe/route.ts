// This is the only place in the app that grants or revokes paid access —
// mirrors the role the old Paddle webhook played (Foundation §8 delicate zone).

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DbSubscriptionStatus = "active" | "canceled" | "past_due";

type Plan = "silver" | "gold";
type Frequency = "monthly" | "6months" | "annual";

const PRICE_LABEL_MAP: Record<Plan, Record<Frequency, string>> = {
  silver: {
    monthly: "$30",
    "6months": "$170",
    annual: "$320",
  },
  gold: {
    monthly: "$50",
    "6months": "$290",
    annual: "$580",
  },
};

function customerIdOf(customer: Stripe.Subscription["customer"]): string {
  return typeof customer === "string" ? customer : customer.id;
}

function currentPeriodEndOf(subscription: Stripe.Subscription): string | null {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  return currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null;
}

function mapStripeStatus(status: Stripe.Subscription.Status): DbSubscriptionStatus | null {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return null;
  }
}

async function sendSubscriptionActiveEmail(parentProfileId: string, plan: string, frequency: string) {
  try {
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", parentProfileId)
      .single();

    if (!parentProfile?.email) return;

    const planLabel = plan === "gold" ? "Gold" : "Silver";
    const frequencyLabel =
      frequency === "monthly"
        ? "monthly"
        : frequency === "6months"
        ? "every 6 months"
        : frequency === "annual"
        ? "annual"
        : frequency;
    const priceLabel =
      PRICE_LABEL_MAP[plan === "gold" ? "gold" : "silver"][
        frequency === "monthly" ? "monthly" : frequency === "6months" ? "6months" : "annual"
      ];

    await sendEmail({
      to: parentProfile.email,
      subject: "Your High School Prospect subscription is active",
      html: renderEmail({
        preheader: "Your subscription is now active.",
        firstName: parentProfile.full_name?.split(" ")[0] || "there",
        headline: `Your ${planLabel} subscription is now active.`,
        subline: `You're billed ${priceLabel} ${frequencyLabel}. Cancel anytime — no long-term commitment. Head to the dashboard to get started.`,
        ctaLabel: "Go to dashboard",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`,
      }),
    });
  } catch {
    // Confirmation email is best-effort; never let it affect the webhook response.
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const { studentId, parentProfileId, plan, frequency } = subscription.metadata;

  if (!studentId || !parentProfileId || !plan || !frequency) {
    return NextResponse.json({ received: true, ignored: "missing metadata" });
  }

  const { data: parentRow, error: parentError } = await supabaseAdmin
    .from("parents")
    .select("id")
    .eq("profile_id", parentProfileId)
    .eq("student_id", studentId)
    .single();

  if (parentError || !parentRow) {
    return NextResponse.json({ received: true, ignored: "parent not found" });
  }

  const { error: upsertError } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        parent_id: parentRow.id,
        student_id: studentId,
        plan,
        billing_frequency: frequency,
        provider_subscription_id: subscription.id,
        stripe_customer_id: customerIdOf(subscription.customer),
        status: "active",
        current_period_end: currentPeriodEndOf(subscription),
      },
      { onConflict: "provider_subscription_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: "Failed to record subscription." }, { status: 500 });
  }

  const { error: studentError } = await supabaseAdmin
    .from("students")
    .update({ subscription_status: "paid" })
    .eq("id", studentId);

  if (studentError) {
    return NextResponse.json({ error: "Failed to update student status." }, { status: 500 });
  }

  await sendSubscriptionActiveEmail(parentProfileId, plan, frequency);

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const mappedStatus = mapStripeStatus(subscription.status);
  if (!mappedStatus) {
    return NextResponse.json({ received: true, ignored: "unrecognized status" });
  }

  const { data: subscriptionRow, error: findError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, student_id")
    .eq("provider_subscription_id", subscription.id)
    .single();

  if (findError || !subscriptionRow) {
    return NextResponse.json({ received: true, ignored: "subscription not found" });
  }

  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: mappedStatus,
      stripe_customer_id: customerIdOf(subscription.customer),
      current_period_end: currentPeriodEndOf(subscription),
    })
    .eq("id", subscriptionRow.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
  }

  if (subscriptionRow.student_id) {
    const studentSubscriptionStatus = mappedStatus === "active" ? "paid" : "free";
    const { error: studentError } = await supabaseAdmin
      .from("students")
      .update({ subscription_status: studentSubscriptionStatus })
      .eq("id", subscriptionRow.student_id);

    if (studentError) {
      return NextResponse.json({ error: "Failed to update student status." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: subscriptionRow, error: findError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, student_id")
    .eq("provider_subscription_id", subscription.id)
    .single();

  if (findError || !subscriptionRow) {
    return NextResponse.json({ received: true, ignored: "subscription not found" });
  }

  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("id", subscriptionRow.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
  }

  if (subscriptionRow.student_id) {
    const { error: studentError } = await supabaseAdmin
      .from("students")
      .update({ subscription_status: "free" })
      .eq("id", subscriptionRow.student_id);

    if (studentError) {
      return NextResponse.json({ error: "Failed to update student status." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signatureHeader!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
        return await handleSubscriptionCreated(event.data.object);
      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(event.data.object);
      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(event.data.object);
      default:
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("[stripe webhook] unhandled error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
