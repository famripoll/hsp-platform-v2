const FONT_STACK = "Helvetica, Arial, sans-serif";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isPresent(value: string | number | null | undefined): value is string | number {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return true;
  return value.trim().length > 0;
}

export function renderCollegeContactEmail(params: {
  studentFullName: string;
  graduationYear: string | null;
  primaryPosition: string | null;
  secondaryPosition: string | null;
  highSchool: string | null;
  height: string | null;
  weight: string | null;
  gpa: string | number | null;
  message: string;
  profileUrl: string;
  coachName: string | null;
  institutionName: string;
}): string {
  const studentFullName = escapeHtml(params.studentFullName);
  const institutionName = escapeHtml(params.institutionName);
  const profileUrl = escapeHtml(params.profileUrl);

  const greeting = isPresent(params.coachName)
    ? `Hi ${escapeHtml(String(params.coachName))},`
    : "Hello,";

  const intro = `A high school baseball player is reaching out to your program at ${institutionName} through High School Prospect.`;

  const message = escapeHtml(params.message).replace(/\r\n|\r|\n/g, "<br>");

  const preheader = escapeHtml(
    `${params.studentFullName} sent your program a message through High School Prospect.`
  );

  const positions = [params.primaryPosition, params.secondaryPosition]
    .filter(isPresent)
    .map((v) => escapeHtml(String(v)))
    .join(", ");

  const heightWeight = [params.height, params.weight]
    .filter(isPresent)
    .map((v) => escapeHtml(String(v)))
    .join(" / ");

  const rows: Array<{ label: string; value: string }> = [];
  rows.push({ label: "Name", value: studentFullName });
  if (isPresent(params.graduationYear)) {
    rows.push({ label: "Graduation year", value: escapeHtml(String(params.graduationYear)) });
  }
  if (positions.length > 0) {
    rows.push({ label: "Position(s)", value: positions });
  }
  if (isPresent(params.highSchool)) {
    rows.push({ label: "High school", value: escapeHtml(String(params.highSchool)) });
  }
  if (heightWeight.length > 0) {
    rows.push({ label: "Height / Weight", value: heightWeight });
  }
  if (isPresent(params.gpa)) {
    rows.push({ label: "GPA", value: escapeHtml(String(params.gpa)) });
  }

  const dataRows = rows
    .map(
      ({ label, value }) => `
                  <tr>
                    <td style="padding: 6px 16px 6px 0; font-family: ${FONT_STACK}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; color: #64748b; white-space: nowrap; vertical-align: top;">${label}</td>
                    <td style="padding: 6px 0; font-family: ${FONT_STACK}; font-size: 15px; color: #0f172a; line-height: 1.5; vertical-align: top;">${value}</td>
                  </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#ffffff;">
  <div style="display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%; background-color:#ffffff; padding:24px 0;">
    <tr>
      <td align="center" style="padding: 0 16px;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" bgcolor="#ffffff" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
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
                    <p style="font-family: ${FONT_STACK}; font-size: 15px; color: #0f172a; line-height: 1.6; margin: 0 0 18px;">${greeting}</p>
                    <p style="font-family: ${FONT_STACK}; font-size: 15px; color: #64748b; line-height: 1.6; margin: 0 0 24px;">${intro}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="border-left: 4px solid #d93025; background-color: #f8fafc; padding: 16px 20px;">
                          <p style="font-family: ${FONT_STACK}; font-size: 15px; color: #0f172a; line-height: 1.7; margin: 0; font-style: italic;">${message}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 28px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">${dataRows}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 28px; padding-bottom: 32px; text-align: center;" align="center">
                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td bgcolor="#d93025" style="border-radius:6px;">
                          <a href="${profileUrl}" style="display:inline-block; padding:14px 40px; font-family: ${FONT_STACK}; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none;">View ${studentFullName}'s full profile</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 28px; border-top: 1px solid #e2e8f0; text-align: center;" align="center">
                    <p style="font-family: ${FONT_STACK}; font-size: 13px; color: #64748b; line-height: 1.6; margin: 18px 0 0; text-align: center;">This profile link expires in 30 days. If you'd like to reply, you can create a free account on High School Prospect &mdash; it's not required to view the profile.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 28px;" align="center">
                    <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #64748b; line-height: 1.6; margin: 0 0 3px; text-align: center;">High School Prospect</p>
                    <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #64748b; line-height: 1.6; margin: 0 0 3px; text-align: center;">Ripoll Services, LLC</p>
                    <p style="font-family: ${FONT_STACK}; font-size: 12px; color: #64748b; line-height: 1.6; margin: 0; text-align: center;">261 N University Dr, Suite 500-1027, Plantation, FL 33324</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
