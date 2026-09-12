import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public CAN-SPAM opt-out endpoint. Every branch — bad JSON, malformed token,
// unknown token, database error, duplicate unsubscribe — returns exactly this.
// The response must never disclose whether a token resolves to a real coach,
// and must never echo an email address back to the browser.
const SUCCESS = { status: "success" as const };

export async function POST(request: NextRequest) {
  let token: unknown;
  try {
    ({ token } = await request.json());
  } catch {
    return NextResponse.json(SUCCESS);
  }

  // Validate the token shape before touching the database.
  if (typeof token !== "string" || !UUID_RE.test(token)) {
    return NextResponse.json(SUCCESS);
  }

  // The page has no session. college_contact_recipients and
  // college_contact_unsubscribes both have RLS enabled with zero policies, so
  // this data is only reachable via the service-role key.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: recipient } = await supabaseAdmin
    .from("college_contact_recipients")
    .select("email, contact_id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!recipient || typeof recipient.email !== "string" || !recipient.email) {
    return NextResponse.json(SUCCESS);
  }

  const email = recipient.email.toLowerCase();

  // Upsert on the unique lowercase email so a coach who clicks an old link a
  // second time is a silent no-op, not a 409. This suppression never expires.
  await supabaseAdmin.from("college_contact_unsubscribes").upsert(
    {
      email,
      source_contact_id: recipient.contact_id ?? null,
      unsubscribed_at: new Date().toISOString(),
    },
    { onConflict: "email", ignoreDuplicates: true }
  );

  // Let support know a coach opted out. Best-effort: it runs in `after()` so it
  // neither delays the coach's confirmation nor, if it fails, changes the status
  // code the coach's browser sees.
  after(async () => {
    try {
      await sendEmail({
        to: "support@highschoolprospect.com",
        subject: "A coach unsubscribed from College Contacts",
        html: renderEmail({
          preheader: "A coach has opted out of College Contact outreach.",
          firstName: "Team",
          headline: "A coach has unsubscribed from College Contacts.",
          subline:
            "They have been added to the suppression list and will no longer receive outreach from High School Prospect student athletes.",
          ctaLabel: "Open High School Prospect",
          ctaUrl: process.env.NEXT_PUBLIC_APP_URL as string,
          note: `Unsubscribed address: ${email}`,
        }),
      });
    } catch {
      // Swallow: the notification is best-effort only.
    }
  });

  return NextResponse.json(SUCCESS);
}
