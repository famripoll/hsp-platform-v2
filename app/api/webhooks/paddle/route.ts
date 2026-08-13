import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

interface PaddleCustomData {
  student_id?: string;
  parent_profile_id?: string;
  plan?: string;
  billing_frequency?: string;
}

interface PaddleWebhookPayload {
  event_type?: string;
  data?: {
    id?: string;
    status?: string;
    custom_data?: PaddleCustomData | null;
  };
}

const subscriptionStatusMap: Record<string, "active" | "canceled" | "past_due"> = {
  active: "active",
  canceled: "canceled",
  past_due: "past_due",
  paused: "past_due",
};

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(";")) {
    const [key, value] = segment.split("=");
    if (key && value) parts[key] = value;
  }

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const tsSeconds = Number(ts);
  if (!Number.isFinite(tsSeconds)) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds - tsSeconds > MAX_SIGNATURE_AGE_SECONDS) return false;

  const expectedHex = createHmac("sha256", process.env.PADDLE_WEBHOOK_SECRET!)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const actualBuffer = Buffer.from(h1, "hex");

  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

async function handleSubscriptionGrant(data: NonNullable<PaddleWebhookPayload["data"]>) {
  const customData = data.custom_data;
  const providerSubscriptionId = data.id;
  const studentId = customData?.student_id;
  const parentProfileId = customData?.parent_profile_id;
  const plan = customData?.plan;
  const billingFrequency = customData?.billing_frequency;

  if (!customData || !studentId || !parentProfileId || !plan || !billingFrequency || !providerSubscriptionId) {
    return NextResponse.json({ received: true, ignored: "missing custom_data" });
  }

  const { data: parentRow, error: parentError } = await supabaseAdmin
    .from("parents")
    .select("id")
    .eq("profile_id", parentProfileId)
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
        billing_frequency: billingFrequency,
        provider_subscription_id: providerSubscriptionId,
        status: "active",
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

  const { data: parentProfile } = await supabaseAdmin
    .from("profiles")
    .select("email, full_name")
    .eq("id", parentProfileId)
    .single();

  if (parentProfile?.email) {
    const planLabel = plan === "gold" ? "Gold" : "Silver";
    const frequencyLabel =
      billingFrequency === "monthly"
        ? "monthly"
        : billingFrequency === "6months"
        ? "every 6 months"
        : billingFrequency === "annual"
        ? "annual"
        : billingFrequency;

    await sendEmail({
      to: parentProfile.email,
      subject: "Your High School Prospect subscription is active",
      html: renderEmail({
        preheader: "Your subscription is now active.",
        firstName: parentProfile.full_name?.split(" ")[0] || "there",
        headline: `Your ${planLabel} subscription is now active.`,
        subline: `You're billed ${frequencyLabel}. Head to the dashboard to get started.`,
        ctaLabel: "Go to dashboard",
        ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student`,
      }),
    });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionCanceled(data: NonNullable<PaddleWebhookPayload["data"]>) {
  const providerSubscriptionId = data.id;
  if (!providerSubscriptionId) {
    return NextResponse.json({ received: true, ignored: "missing subscription id" });
  }

  const { data: subscriptionRow, error: findError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, student_id")
    .eq("provider_subscription_id", providerSubscriptionId)
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

async function handleSubscriptionUpdated(data: NonNullable<PaddleWebhookPayload["data"]>) {
  const providerSubscriptionId = data.id;
  if (!providerSubscriptionId) {
    return NextResponse.json({ received: true, ignored: "missing subscription id" });
  }

  const { data: subscriptionRow, error: findError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, student_id")
    .eq("provider_subscription_id", providerSubscriptionId)
    .single();

  if (findError || !subscriptionRow) {
    return NextResponse.json({ received: true, ignored: "subscription not found" });
  }

  const mappedStatus = data.status ? subscriptionStatusMap[data.status] : undefined;
  if (!mappedStatus) {
    return NextResponse.json({ received: true, ignored: "unrecognized status" });
  }

  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: mappedStatus })
    .eq("id", subscriptionRow.id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
  }

  if (subscriptionRow.student_id) {
    const { error: studentError } = await supabaseAdmin
      .from("students")
      .update({ subscription_status: mappedStatus === "active" ? "paid" : "free" })
      .eq("id", subscriptionRow.student_id);

    if (studentError) {
      return NextResponse.json({ error: "Failed to update student status." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("Paddle-Signature");

    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as PaddleWebhookPayload;
    const data = payload.data ?? {};

    switch (payload.event_type) {
      case "subscription.activated":
      case "subscription.created":
        return await handleSubscriptionGrant(data);
      case "subscription.canceled":
        return await handleSubscriptionCanceled(data);
      case "subscription.updated":
        return await handleSubscriptionUpdated(data);
      case "transaction.completed":
        return NextResponse.json({ received: true });
      default:
        return NextResponse.json({ received: true });
    }
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
