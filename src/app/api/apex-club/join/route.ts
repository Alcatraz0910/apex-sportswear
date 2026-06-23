import { NextResponse } from "next/server";
import { adminMutate, shopifyConfigured } from "@/lib/shopify";
import { sendEmail, emailConfigured } from "@/lib/email";
import { verifyEmailHtml } from "@/lib/emailTemplates";

// Apex Club signup. Creates a Shopify customer with PENDING marketing consent so
// Shopify sends the double opt-in confirmation (that's the email verification), plus
// Apex Club metafields (member flag, draw entries, referral code, referred-by, TikTok).
// Entry crediting (verified -> +1 entry, referral bonus) happens on the customers/update
// webhook once they confirm. Requires the app to have write_customers scope + double
// opt-in enabled in Shopify marketing settings.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function referralCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

interface CustomerCreate {
  customerCreate: {
    customer: { id: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
}

const MUTATION = `
  mutation($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

export async function POST(req: Request) {
  let body: { email?: string; tiktok?: string; ref?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const tiktok = (body.tiktok ?? "").trim().replace(/^@/, "");
  const ref = (body.ref ?? "").trim().toUpperCase().slice(0, 12);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });
  }
  if (!shopifyConfigured) {
    return NextResponse.json(
      { ok: false, error: "Sign-ups are temporarily unavailable — please try again soon." },
      { status: 503 },
    );
  }

  const code = referralCode();
  const token = crypto.randomUUID();
  const metafields = [
    { namespace: "apex_club", key: "member", type: "boolean", value: "false" },
    { namespace: "apex_club", key: "entries", type: "number_integer", value: "0" },
    { namespace: "apex_club", key: "referral_code", type: "single_line_text_field", value: code },
    { namespace: "apex_club", key: "verify_token", type: "single_line_text_field", value: token },
    ...(ref
      ? [{ namespace: "apex_club", key: "referred_by", type: "single_line_text_field", value: ref }]
      : []),
    ...(tiktok
      ? [{ namespace: "apex_club", key: "tiktok", type: "single_line_text_field", value: tiktok }]
      : []),
  ];

  const input = {
    email,
    emailMarketingConsent: {
      marketingState: "PENDING",
      marketingOptInLevel: "CONFIRMED_OPT_IN",
    },
    tags: ["apex-club"],
    metafields,
  };

  try {
    const data = await adminMutate<CustomerCreate>(MUTATION, { input });
    const errs = data.customerCreate.userErrors ?? [];
    if (errs.length) {
      const taken = errs.some((e) => /taken|already|been used/i.test(e.message));
      return NextResponse.json(
        {
          ok: false,
          error: taken
            ? "You're already on the list — check your inbox to confirm."
            : errs[0].message,
        },
        { status: 400 },
      );
    }
    // Send our own verification email — Shopify doesn't send its confirmation for
    // Admin-API-created customers.
    const numericId = (data.customerCreate.customer?.id ?? "").split("/").pop() ?? "";
    const base = process.env.APEX_SITE_URL || new URL(req.url).origin;
    const confirmUrl = `${base}/api/apex-club/verify?id=${numericId}&token=${token}`;
    if (emailConfigured) {
      try {
        await sendEmail({
          to: email,
          subject: "Confirm your email — Apex Club",
          html: verifyEmailHtml(confirmUrl),
        });
      } catch (e) {
        console.error("[apex-club/join] verification email failed:", e);
      }
    } else {
      console.warn("[apex-club/join] RESEND_API_KEY not set — verification email skipped.");
    }

    return NextResponse.json({
      ok: true,
      message:
        "Almost there — check your email to confirm and claim your free draw entry. " +
        "(Check your junk/spam folder too — it can take a minute.)",
      referralCode: code,
      referralPath: `/apex-club?ref=${code}`,
    });
  } catch (err) {
    console.error("[apex-club/join] failed:", err);
    return NextResponse.json(
      { ok: false, error: "Sign-ups are temporarily unavailable — please try again soon." },
      { status: 503 },
    );
  }
}
