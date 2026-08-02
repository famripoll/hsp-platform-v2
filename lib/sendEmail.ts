const FROM_ADDRESS = "High School Prospect <noreply@highschoolprospect.com>";

const FONT_STACK = "Helvetica, Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEmail(params: {
  preheader: string;
  firstName: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaUrl: string;
  note?: string;
  bullets?: string[];
  bulletsHeading?: string;
}): string {
  const preheader = escapeHtml(params.preheader);
  const firstName = escapeHtml(params.firstName);
  const headline = escapeHtml(params.headline);
  const subline = escapeHtml(params.subline);
  const ctaLabel = escapeHtml(params.ctaLabel);
  const note = params.note !== undefined ? escapeHtml(params.note) : undefined;
  const bulletsHeading =
    params.bulletsHeading !== undefined ? escapeHtml(params.bulletsHeading) : undefined;
  const bullets = params.bullets?.map((bullet) => escapeHtml(bullet));

  const safeCtaUrl = params.ctaUrl.startsWith("https://") || params.ctaUrl.startsWith("http://")
    ? params.ctaUrl
    : `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  const ctaUrl = safeCtaUrl.replace(/"/g, "&quot;");

  const bulletsSection =
    bullets && bullets.length > 0
      ? `
                <tr>
                  <td>
                    ${bulletsHeading ? `<p style="font-family: ${FONT_STACK}; font-size: 15px; color: #0f172a; font-weight: 600; line-height: 1.6; margin: 0 0 12px;">${bulletsHeading}</p>` : ""}
                    ${bullets
                      .map(
                        (bullet) =>
                          `<p style="font-family: ${FONT_STACK}; font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 8px;"><span style="color:#d93025;">&bull;</span>&nbsp;&nbsp;${bullet}</p>`
                      )
                      .join("\n                    ")}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 28px;"></td>
                </tr>`
      : "";

  const noteRow = note
    ? `
              <tr>
                <td style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
                  <p style="font-family: ${FONT_STACK}; font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">${note}</p>
                </td>
              </tr>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0;">
  <div style="display:none; font-size:1px; color:#f1f5f9; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f5f9" style="width:100%; background-color:#f1f5f9; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#ffffff" style="width:600px; background-color:#ffffff; border-radius:8px;">
          <tr>
            <td style="padding: 28px 32px 22px; border-bottom: 3px solid #d93025;">
              <span style="color:#d93025; font-family: ${FONT_STACK}; font-size:26px; font-weight:600; letter-spacing:-0.3px;">High</span><span style="color:#0f172a; font-family: ${FONT_STACK}; font-size:26px; font-weight:600; letter-spacing:-0.3px;">&nbsp;School Prospect</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="font-family: ${FONT_STACK}; font-size: 15px; color: #0f172a; line-height: 1.6; margin: 0 0 18px;">Hi ${firstName},</p>
                    <p style="font-family: ${FONT_STACK}; font-size: 15px; color: #0f172a; line-height: 1.6; margin: 0 0 10px;">${headline}</p>
                    <p style="font-family: ${FONT_STACK}; font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 28px;">${subline}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0" align="left">
                      <tr>
                        <td bgcolor="#d93025" style="border-radius:6px;">
                          <a href="${ctaUrl}" style="display:inline-block; padding:14px 40px; font-family: ${FONT_STACK}; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">${ctaLabel}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 28px;"></td>
                </tr>${bulletsSection}${noteRow}
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#e2e8f0" style="background-color:#e2e8f0; border-top: 1px solid #cbd5e1; padding: 26px 32px;">
              <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #475569; line-height: 1.6; margin: 0 0 3px;">Ripoll Services, LLC</p>
              <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #475569; line-height: 1.6; margin: 0 0 3px;">261 N University Dr</p>
              <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #475569; line-height: 1.6; margin: 0 0 3px;">Suite 500-1027</p>
              <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #475569; line-height: 1.6; margin: 0 0 16px;">Plantation, FL 33324</p>
              <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #475569; line-height: 1.6; margin: 0;">
                <a href="https://www.facebook.com/high.school.prospect/" style="color:#0f172a; text-decoration:underline;">Facebook</a><span style="color:#94a3b8; padding:0 10px;">&middot;</span><a href="https://www.instagram.com/high.school.prospect/" style="color:#0f172a; text-decoration:underline;">Instagram</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
