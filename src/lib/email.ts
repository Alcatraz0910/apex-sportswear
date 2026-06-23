// Transactional email via Resend (REST API — no SDK dependency). Used for the Apex
// Club email verification, since Shopify's native double opt-in doesn't fire for
// customers created through the Admin API. Set RESEND_API_KEY (+ optional
// APEX_FROM_EMAIL) in .env.local. Server-only.

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
// For real sends you must verify a domain in Resend and use an address on it.
// onboarding@resend.dev only delivers to your own Resend account email (fine for a test).
const FROM = process.env.APEX_FROM_EMAIL ?? "Apex Sportswear <onboarding@resend.dev>";

export const emailConfigured = Boolean(RESEND_API_KEY);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  }
}
