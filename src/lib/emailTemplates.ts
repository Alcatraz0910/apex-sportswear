// Branded HTML email templates (inline styles + table layout for email-client
// compatibility). Used by the Resend sender in lib/email.ts.

export function verifyEmailHtml(confirmUrl: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141414;border:1px solid #262626;border-radius:24px;">
          <tr><td style="padding:32px 32px 0;">
            <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">APEX<span style="color:#00e676;">.</span></div>
          </td></tr>
          <tr><td style="padding:22px 32px 4px;">
            <h1 style="margin:0;color:#ffffff;font-size:23px;line-height:1.25;">Confirm your email to enter the draw</h1>
            <p style="margin:14px 0 0;color:#a3a3a3;font-size:15px;line-height:1.6;">
              You're one click from joining the <strong style="color:#ffffff;">Apex Club</strong> — and your free entry to
              <strong style="color:#00e676;">win a football shirt</strong>, drawn <strong style="color:#ffffff;">live on TikTok on 30 July 2026</strong>. Confirm your email to lock it in.
            </p>
            <p style="margin:10px 0 0;color:#a3a3a3;font-size:14px;line-height:1.6;">
              Follow <a href="https://www.tiktok.com/@apex.sportswear6" style="color:#00e676;text-decoration:none;">@apex.sportswear6</a> on TikTok to watch the draw live &amp; earn a bonus entry.
            </p>
          </td></tr>
          <tr><td align="center" style="padding:26px 32px;">
            <a href="${confirmUrl}" style="display:inline-block;background:#00e676;color:#000000;text-decoration:none;font-weight:700;font-size:16px;padding:14px 30px;border-radius:9999px;">Confirm my email &amp; enter →</a>
          </td></tr>
          <tr><td style="padding:0 32px 10px;">
            <p style="margin:0;color:#737373;font-size:13px;line-height:1.6;">
              Button not working? Paste this into your browser:<br>
              <a href="${confirmUrl}" style="color:#00e676;word-break:break-all;">${confirmUrl}</a>
            </p>
          </td></tr>
          <tr><td style="padding:16px 32px 32px;border-top:1px solid #262626;">
            <p style="margin:16px 0 0;color:#737373;font-size:12px;line-height:1.6;">
              No purchase necessary. UK 18+. Didn't sign up? You can safely ignore this email.<br>Apex Sportswear
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
