import { NextResponse } from "next/server";
import { adminMutate } from "@/lib/shopify";

// Email verification confirm-link target. Validates the token stored on the customer,
// then grants membership + draw entries (+1 verify, +1 if a TikTok handle was given),
// marks them email-subscribed, and credits the referrer (+1, capped). Idempotent
// (guards on the member flag; uses no-store reads via adminMutate so it never replays
// stale cached data). Redirects back to /apex-club?verified=1|0.

const NS = "apex_club";
const REFERRAL_CAP = 10;
const TYPES: Record<string, string> = {
  entries: "number_integer",
  referral_entries: "number_integer",
  member: "boolean",
  referral_credited: "boolean",
};

function mfMap(nodes: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(nodes.map((n) => [n.key, n.value]));
}

async function setMetafields(ownerId: string, kv: Record<string, string>) {
  const metafields = Object.entries(kv).map(([key, value]) => ({
    ownerId,
    namespace: NS,
    key,
    type: TYPES[key] ?? "single_line_text_field",
    value: String(value),
  }));
  const res = await adminMutate<{ metafieldsSet: { userErrors: { message: string }[] } }>(
    "mutation($mf:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$mf){ userErrors{field message} } }",
    { mf: metafields },
  );
  if (res.metafieldsSet.userErrors?.length) {
    throw new Error("metafieldsSet failed: " + JSON.stringify(res.metafieldsSet.userErrors));
  }
}

async function creditReferrer(code: string) {
  const data = await adminMutate<{
    customers: { nodes: { id: string; metafields: { nodes: { key: string; value: string }[] } }[] };
  }>(
    `{ customers(first:100, query:"tag:apex-club"){ nodes{ id metafields(first:20,namespace:"${NS}"){nodes{key value}} } } }`,
    {},
  );
  for (const c of data.customers.nodes) {
    const m = mfMap(c.metafields.nodes);
    if (m.referral_code === code) {
      const used = parseInt(m.referral_entries || "0", 10);
      if (used < REFERRAL_CAP) {
        await setMetafields(c.id, {
          entries: String(parseInt(m.entries || "0", 10) + 1),
          referral_entries: String(used + 1),
        });
      }
      return;
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.APEX_SITE_URL || url.origin;
  const id = (url.searchParams.get("id") || "").replace(/\D/g, "");
  const token = url.searchParams.get("token") || "";
  const done = (ok: boolean) => NextResponse.redirect(`${base}/apex-club?verified=${ok ? 1 : 0}`);

  if (!id || !token) return done(false);
  const gid = `gid://shopify/Customer/${id}`;

  try {
    const data = await adminMutate<{
      customer: {
        id: string;
        metafields: { nodes: { key: string; value: string }[] };
      } | null;
    }>(
      `query($id:ID!){ customer(id:$id){ id metafields(first:20,namespace:"${NS}"){nodes{key value}} } }`,
      { id: gid },
    );
    const customer = data.customer;
    if (!customer) return done(false);

    const m = mfMap(customer.metafields.nodes);
    if (m.member === "true") return done(true); // already verified (idempotent)
    if (!m.verify_token || m.verify_token !== token) return done(false);

    const add = 1 + (m.tiktok ? 1 : 0);
    const entries = parseInt(m.entries || "0", 10) + add;

    // Grant membership + entries. verify_token -> "used" (NOT "" — Shopify rejects blank
    // metafield values, which was silently failing the whole write).
    await setMetafields(gid, { member: "true", entries: String(entries), verify_token: "used" });
    await adminMutate(
      `mutation($id:ID!){ customerEmailMarketingConsentUpdate(input:{ customerId:$id,
        emailMarketingConsent:{ marketingState:SUBSCRIBED, marketingOptInLevel:CONFIRMED_OPT_IN } }){
        userErrors{message} } }`,
      { id: gid },
    );

    if (m.referred_by && m.referral_credited !== "true") {
      await creditReferrer(m.referred_by);
      await setMetafields(gid, { referral_credited: "true" });
    }

    return done(true);
  } catch (err) {
    console.error("[apex-club/verify] failed:", err);
    return done(false);
  }
}
