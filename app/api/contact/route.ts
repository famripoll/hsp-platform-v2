import { NextRequest, NextResponse } from "next/server";
import { sendEmail, renderEmail } from "@/lib/sendEmail";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  const { fullName, email, school, message, turnstileToken } = await request.json();

  const clientIp = request.headers.get("CF-Connecting-IP");

  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
        ...(clientIp ? { remoteip: clientIp } : {}),
      }),
    }
  );

  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok || !verifyData.success) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 403 }
    );
  }

  const trimmedFullName = typeof fullName === "string" ? fullName.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedSchool = typeof school === "string" ? school.trim() : "";
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedFullName || trimmedFullName.length > 100) {
    return NextResponse.json({ error: "Please enter a valid full name." }, { status: 400 });
  }

  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 255) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!trimmedSchool || trimmedSchool.length > 150) {
    return NextResponse.json({ error: "Please enter a valid school name." }, { status: 400 });
  }

  if (!trimmedMessage || trimmedMessage.length > 300) {
    return NextResponse.json({ error: "Please enter a valid message." }, { status: 400 });
  }

  const submittedAt = new Date().toISOString();

  const internalHtml = `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; font-family: Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; border:1px solid #e2e8f0; border-radius:8px;">
          <tr>
            <td style="padding: 24px 28px;">
              <h2 style="font-family: Helvetica, Arial, sans-serif; font-size: 18px; color: #0f172a; margin: 0 0 20px;">New contact form message</h2>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #0f172a; margin: 0 0 10px;"><strong>Full Name:</strong> ${escapeHtml(trimmedFullName)}</p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #0f172a; margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(trimmedEmail)}</p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #0f172a; margin: 0 0 10px;"><strong>School Name:</strong> ${escapeHtml(trimmedSchool)}</p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #0f172a; margin: 0 0 10px;"><strong>Message:</strong></p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #0f172a; margin: 0 0 20px; white-space: pre-wrap;">${escapeHtml(trimmedMessage)}</p>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #64748b; margin: 0;">Submitted at: ${escapeHtml(submittedAt)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const internalSent = await sendEmail({
    to: "contactform@highschoolprospect.com",
    subject: `New contact form message from ${trimmedFullName}`,
    replyTo: trimmedEmail,
    html: internalHtml,
  });

  if (!internalSent) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }

  const visitorFirstName = trimmedFullName.split(/\s+/)[0] || "there";

  await sendEmail({
    to: trimmedEmail,
    subject: "We received your message",
    replyTo: "contactform@highschoolprospect.com",
    html: renderEmail({
      preheader: "Thanks for contacting High School Prospect.",
      firstName: visitorFirstName,
      headline: "Thanks for reaching out.",
      subline:
        "We've received your message and someone from our team will get back to you shortly. We typically respond within two business days.",
      ctaLabel: "Visit High School Prospect",
      ctaUrl: process.env.NEXT_PUBLIC_APP_URL as string,
      note: "This is an automatic confirmation. There's no need to reply to this email.",
    }),
  });

  return NextResponse.json({ success: true });
}
