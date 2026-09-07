import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase-server";
import { computeCycleStart, PLAN_LIMITS } from "@/lib/collegeContactQuota";
import { sendEmail, renderEmail } from "@/lib/sendEmail";
import { renderCollegeContactEmail } from "@/lib/collegeContactEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_BODY_LENGTH = 500;

const CONTACT_INFO_MESSAGE =
  "Phone numbers and email addresses are not allowed in your message. The coach will reply to you through the platform.";

export async function POST(request: NextRequest) {
  try {
    const { unitid, body } = await request.json();

    if (typeof unitid !== "number" || typeof body !== "string") {
      return NextResponse.json({ error: "Missing unitid or body." }, { status: 400 });
    }

    const trimmedBody = body.trim();
    if (!trimmedBody || trimmedBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: "Message must be between 1 and 500 characters." },
        { status: 400 }
      );
    }

    if (/\d(?:[ .\-()]?\d){9,}/.test(trimmedBody)) {
      return NextResponse.json({ error: CONTACT_INFO_MESSAGE }, { status: 400 });
    }
    if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(trimmedBody)) {
      return NextResponse.json({ error: CONTACT_INFO_MESSAGE }, { status: 400 });
    }

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

    if (profile?.role === "parent") {
      return NextResponse.json(
        { error: "Parents cannot send contacts on behalf of a student." },
        { status: 403 }
      );
    }

    if (!profile || profile.role !== "student") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { data: student } = await supabase
      .from("students")
      .select(
        "id, profile_id, subscription_status, full_name, graduation_year, primary_position, secondary_position, high_school, height, weight, gpa"
      )
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!student) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (student.subscription_status !== "paid") {
      return NextResponse.json(
        { error: "This student does not have an active subscription." },
        { status: 403 }
      );
    }

    const { count: photoCount } = await supabaseAdmin
      .from("student_media")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", student.profile_id)
      .eq("media_type", "photo");

    const { count: videoCount } = await supabaseAdmin
      .from("student_media")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", student.profile_id)
      .eq("media_type", "video");

    if ((photoCount ?? 0) < 1 || (videoCount ?? 0) < 1) {
      return NextResponse.json(
        {
          error:
            "Upload at least one photo and one video to your profile before contacting a college.",
        },
        { status: 403 }
      );
    }

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, created_at")
      .eq("student_id", student.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 403 });
    }

    const planLimit = PLAN_LIMITS[subscription.plan as string];
    if (!planLimit) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 403 });
    }

    const cycleStart = computeCycleStart(subscription.created_at);
    const cycleStartIso = cycleStart.toISOString();

    const { count: contactCount } = await supabaseAdmin
      .from("college_contacts")
      .select("*", { count: "exact", head: true })
      .eq("student_id", student.id)
      .gte("created_at", cycleStartIso);

    if ((contactCount ?? 0) >= planLimit) {
      return NextResponse.json(
        {
          error: `You have reached your limit of ${planLimit} college contacts this month on the ${subscription.plan} plan.`,
        },
        { status: 403 }
      );
    }

    const { data: university } = await supabaseAdmin
      .from("universities")
      .select("unitid, institution_name")
      .eq("unitid", unitid)
      .maybeSingle();

    if (!university) {
      return NextResponse.json({ error: "University not found." }, { status: 404 });
    }

    const { data: duplicates, error: duplicateError } = await supabaseAdmin
      .from("college_contacts")
      .select("id")
      .eq("student_id", student.id)
      .eq("unitid", unitid)
      .gte("created_at", cycleStartIso)
      .limit(1);

    if (duplicateError) {
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    if (duplicates && duplicates.length > 0) {
      return NextResponse.json(
        { error: "You have already contacted this university this month." },
        { status: 409 }
      );
    }

    const { data: staffRows } = await supabaseAdmin
      .from("program_staff")
      .select("id, first_name, last_name, email")
      .eq("unitid", unitid)
      .not("email", "is", null)
      .not("first_name", "is", null)
      .neq("first_name", "");

    const recipients = staffRows ?? [];

    const profileToken = crypto.randomUUID();
    const profileTokenExpiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("college_contacts")
      .insert({
        student_id: student.id,
        unitid,
        institution_name: university.institution_name,
        body: trimmedBody,
        routed_to_support: recipients.length === 0,
        profile_token: profileToken,
        profile_token_expires_at: profileTokenExpiresAt,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    if (recipients.length > 0) {
      const recipientRows = recipients.map((staff) => ({
        contact_id: inserted.id,
        program_staff_id: staff.id,
        email: staff.email,
        coach_name:
          [staff.first_name, staff.last_name].filter(Boolean).join(" ").trim() || null,
      }));

      const { error: recipientsError } = await supabaseAdmin
        .from("college_contact_recipients")
        .insert(recipientRows);

      if (recipientsError) {
        return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
      }
    }

    // Outreach emails are best-effort: the contact rows are already committed and
    // the student's credit is consumed, so a delivery failure must not fail the request.
    try {
      const toStr = (value: unknown): string | null =>
        value === null || value === undefined || value === "" ? null : String(value);

      const studentName = student.full_name ?? "";
      const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile/${profileToken}`;

      // Single point where the recipient address is chosen. When
      // COLLEGE_CONTACT_TEST_EMAIL is set, every send (outreach and support
      // fallback) is redirected there and the subject is prefixed, so a real
      // coach address never reaches sendEmail.
      const testEmail = process.env.COLLEGE_CONTACT_TEST_EMAIL;
      const testMode = typeof testEmail === "string" && testEmail.length > 0;
      const resolveTo = (realTo: string): string => (testMode ? testEmail! : realTo);
      const subjectPrefix = testMode ? "[TEST] " : "";

      if (recipients.length > 0) {
        await Promise.all(
          recipients.map((staff) => {
            const coachName =
              [staff.first_name, staff.last_name].filter(Boolean).join(" ").trim() || null;

            return sendEmail({
              to: resolveTo(staff.email),
              subject: `${subjectPrefix}${
                studentName || "A high school player"
              } is reaching out through High School Prospect`,
              html: renderCollegeContactEmail({
                studentFullName: studentName,
                graduationYear: toStr(student.graduation_year),
                primaryPosition: toStr(student.primary_position),
                secondaryPosition: toStr(student.secondary_position),
                highSchool: toStr(student.high_school),
                height: toStr(student.height),
                weight: toStr(student.weight),
                gpa: student.gpa ?? null,
                message: trimmedBody,
                profileUrl,
                coachName,
                institutionName: university.institution_name,
              }),
            });
          })
        );
      } else {
        await sendEmail({
          to: resolveTo("support@highschoolprospect.com"),
          subject: `${subjectPrefix}College contact with no coach email on file`,
          html: renderEmail({
            preheader: `${studentName || "A student"} contacted ${university.institution_name} but no coach email is on file.`,
            firstName: "Team",
            headline: `${studentName || "A student"} contacted ${university.institution_name}, but no coach email is on file for that program.`,
            subline: "The outreach was recorded but could not be delivered. Follow up manually if appropriate.",
            ctaLabel: "Open High School Prospect",
            ctaUrl: process.env.NEXT_PUBLIC_APP_URL as string,
            note: `Student's message: ${trimmedBody}`,
          }),
        });
      }
    } catch {
      // Swallow: email dispatch is best-effort and must not affect the response.
    }

    return NextResponse.json({
      success: true,
      institutionName: university.institution_name,
      recipientCount: recipients.length,
      routedToSupport: recipients.length === 0,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
