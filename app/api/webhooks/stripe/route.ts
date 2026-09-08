// This is the only place in the app that grants or revokes paid access —
// mirrors the role the old Paddle webhook played (Foundation §8 delicate zone).

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, renderEmail } from "@/lib/sendEmail";
import { PRICE_ID_TO_PLAN } from "@/lib/stripePrices";

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

async function sendStudentActivatedEmail(studentId: string) {
  try {
    const { data: studentRow } = await supabaseAdmin
      .from("students")
      .select("profile_id, full_name")
      .eq("id", studentId)
      .single();

    if (!studentRow?.profile_id) return;

    const { data: studentProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", studentRow.profile_id)
      .single();

    if (!studentProfile?.email) return;

    const fullName = studentProfile.full_name || studentRow.full_name;

    await sendEmail({
      to: studentProfile.email,
      subject: "Your High School Prospect profile is active",
      html: renderEmail({
        preheader: "Your profile is now active.",
        firstName: fullName?.split(" ")[0] || "there",
        headline: "Your profile is now active.",
        subline:
          "Your parent or guardian has activated your account. You can now log in, complete your profile, and start contacting college programs.",
        ctaLabel: "Log in",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      }),
    });
  } catch {
    // Activation email is best-effort; never let it affect the webhook response.
  }
}

async function sendCancellationScheduledEmail(parentProfileId: string, accessEndsAt: string | null) {
  try {
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", parentProfileId)
      .single();

    if (!parentProfile?.email || !accessEndsAt) return;

    const accessEndsLabel = new Date(accessEndsAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await sendEmail({
      to: parentProfile.email,
      subject: "Your High School Prospect subscription is set to end",
      html: renderEmail({
        preheader: "Your subscription is set to end",
        firstName: parentProfile.full_name?.split(" ")[0] || "there",
        headline: `Your subscription will end on ${accessEndsLabel}.`,
        subline:
          "You'll keep full access to all features until then. If you change your mind, you can restart your subscription at any time before that date.",
        ctaLabel: "Manage Subscription",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/settings?tab=subscription`,
      }),
    });
  } catch {
    // Lifecycle email is best-effort; never let it affect the webhook response.
  }
}

async function sendPaymentFailedEmail(parentProfileId: string) {
  try {
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", parentProfileId)
      .single();

    if (!parentProfile?.email) return;

    await sendEmail({
      to: parentProfile.email,
      subject: "We couldn't process your High School Prospect payment",
      html: renderEmail({
        preheader: "We couldn't process your payment",
        firstName: parentProfile.full_name?.split(" ")[0] || "there",
        headline: "Your latest payment didn't go through.",
        subline:
          "Access to your athlete's profile has been paused. Updating your payment method will restore it right away.",
        ctaLabel: "Update Payment Method",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/settings?tab=subscription`,
      }),
    });
  } catch {
    // Lifecycle email is best-effort; never let it affect the webhook response.
  }
}

async function sendSubscriptionEndedEmail(parentProfileId: string) {
  try {
    const { data: parentProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", parentProfileId)
      .single();

    if (!parentProfile?.email) return;

    await sendEmail({
      to: parentProfile.email,
      subject: "Your High School Prospect subscription has ended",
      html: renderEmail({
        preheader: "Your subscription has ended",
        firstName: parentProfile.full_name?.split(" ")[0] || "there",
        headline: "Your subscription has ended.",
        subline:
          "Your athlete's profile is no longer visible to college coaches, and college outreach is paused. You can restart anytime — all profile information, photos and videos have been saved.",
        ctaLabel: "Choose a Plan",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/upgrade`,
      }),
    });
  } catch {
    // Lifecycle email is best-effort; never let it affect the webhook response.
  }
}

async function sendStudentAccessEndedEmail(studentId: string) {
  try {
    const { data: studentRow } = await supabaseAdmin
      .from("students")
      .select("profile_id, full_name")
      .eq("id", studentId)
      .single();

    if (!studentRow?.profile_id) return;

    const { data: studentProfile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", studentRow.profile_id)
      .single();

    if (!studentProfile?.email) return;

    const fullName = studentProfile.full_name || studentRow.full_name;

    await sendEmail({
      to: studentProfile.email,
      subject: "Your High School Prospect premium features are paused",
      html: renderEmail({
        preheader: "Your premium features are paused",
        firstName: fullName?.split(" ")[0] || "there",
        headline: "Your premium features are now paused.",
        subline:
          "You can still log in and your profile, photos and videos are all saved. Contacting college programs and messaging coaches are paused for now. Ask your parent or guardian if you'd like to continue.",
        ctaLabel: "Log in",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      }),
    });
  } catch {
    // Access-ended email is best-effort; never let it affect the webhook response.
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

  // Stripe's newer API versions signal a portal cancellation via `cancel_at`
  // rather than `cancel_at_period_end`; treat either as "ending".
  const isEnding = subscription.cancel_at !== null || subscription.cancel_at_period_end === true;

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
        cancel_at_period_end: isEnding,
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
  await sendStudentActivatedEmail(studentId);

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const mappedStatus = mapStripeStatus(subscription.status);
  if (!mappedStatus) {
    return NextResponse.json({ received: true, ignored: "unrecognized status" });
  }

  const { data: subscriptionRow, error: findError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, student_id, status, cancel_at_period_end, parent_id")
    .eq("provider_subscription_id", subscription.id)
    .single();

  if (findError || !subscriptionRow) {
    return NextResponse.json({ received: true, ignored: "subscription not found" });
  }

  const currentPriceId = subscription.items.data[0]?.price?.id;
  const mappedPlan = currentPriceId ? PRICE_ID_TO_PLAN[currentPriceId] : undefined;

  // Stripe's newer API versions signal a portal cancellation via `cancel_at`
  // rather than `cancel_at_period_end`; treat either as "ending".
  const isEnding = subscription.cancel_at !== null || subscription.cancel_at_period_end === true;

  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: mappedStatus,
      stripe_customer_id: customerIdOf(subscription.customer),
      current_period_end: currentPeriodEndOf(subscription),
      cancel_at_period_end: isEnding,
      ...(mappedPlan && {
        plan: mappedPlan.plan,
        billing_frequency: mappedPlan.frequency,
      }),
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

  // Stripe delivers these events in bursts, so only email on an actual
  // state transition — never on a repeat event that carries the same state.
  const cancellationJustScheduled =
    subscriptionRow.cancel_at_period_end === false && isEnding === true;
  const paymentJustFailed =
    subscriptionRow.status !== "past_due" && mappedStatus === "past_due";

  if ((cancellationJustScheduled || paymentJustFailed) && subscriptionRow.parent_id) {
    try {
      const { data: parentRow } = await supabaseAdmin
        .from("parents")
        .select("profile_id")
        .eq("id", subscriptionRow.parent_id)
        .single();

      if (parentRow?.profile_id) {
        if (cancellationJustScheduled) {
          await sendCancellationScheduledEmail(
            parentRow.profile_id,
            currentPeriodEndOf(subscription)
          );
        }
        if (paymentJustFailed) {
          await sendPaymentFailedEmail(parentRow.profile_id);
        }
      }
    } catch {
      // Lifecycle emails are best-effort; never let them affect the webhook response.
    }
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: subscriptionRow, error: findError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, student_id, parent_id")
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

  try {
    if (subscriptionRow.parent_id) {
      const { data: parentRow } = await supabaseAdmin
        .from("parents")
        .select("profile_id")
        .eq("id", subscriptionRow.parent_id)
        .single();

      if (parentRow?.profile_id) {
        await sendSubscriptionEndedEmail(parentRow.profile_id);
      }
    }

    if (subscriptionRow.student_id) {
      await sendStudentAccessEndedEmail(subscriptionRow.student_id);
    }
  } catch {
    // Lifecycle emails are best-effort; never let them affect the webhook response.
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
