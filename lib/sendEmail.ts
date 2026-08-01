const FROM_ADDRESS = "High School Prospect <noreply@highschoolprospect.com>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      console.warn("[sendEmail] Resend request failed:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[sendEmail] Resend request error:", error);
    return false;
  }
}
