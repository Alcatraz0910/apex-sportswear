// src/lib/analytics/track.ts
// One neutral event API -> fans out to every provider whose NEXT_PUBLIC_* id is set.
// TikTok is live first; Meta + GA4 auto-enable the moment you add their ids in Vercel.
// Calls are no-ops until consent is granted. The provider snippets queue calls, so
// firing immediately after consent (before the lib finishes loading) is safe.

import { getConsent } from "./consent";

export const PIXELS = {
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  ga4: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
};

export const anyPixelConfigured = Boolean(PIXELS.tiktok || PIXELS.meta || PIXELS.ga4);

export type Item = {
  id: string; // product or variant id
  name?: string;
  price?: number;
  quantity?: number;
  category?: string; // e.g. league: football / nba / f1
};
type Payload = { items?: Item[]; value?: number; currency?: string };

type Ttq = {
  page?: () => void;
  track?: (
    event: string,
    params?: Record<string, unknown>,
    options?: { event_id?: string }
  ) => void;
};
type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    ttq?: Ttq;
    fbq?: Fbq;
    gtag?: Gtag;
  }
}

function ready() {
  return typeof window !== "undefined" && getConsent() === "granted";
}

function newId() {
  // event_id for future client<->server (Conversions API) dedup. Harmless client-only.
  return (
    (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function sum(items?: Item[]) {
  return (items || []).reduce((t, i) => t + (i.price || 0) * (i.quantity ?? 1), 0) || undefined;
}

// ---- public helpers --------------------------------------------------------
export function trackPageView() {
  if (!ready()) return;
  window.ttq?.page?.();
  window.fbq?.("track", "PageView");
  if (PIXELS.ga4) window.gtag?.("event", "page_view"); // config sets send_page_view:false
}

export function trackViewContent(p: Payload & { items: Item[] }) {
  fan("ViewContent", "view_item", p);
}
export function trackAddToCart(p: Payload & { items: Item[] }) {
  fan("AddToCart", "add_to_cart", p);
}
// NOTE: prefer letting the Shopify Web Pixel own InitiateCheckout (fires on the real
// checkout load). Use this only if you want to capture button-click intent — and if
// you do, drop checkout_started from the Shopify pixel to avoid double-counting.
export function trackBeginCheckout(p: Payload & { items?: Item[] }) {
  fan("InitiateCheckout", "begin_checkout", p);
}

// ---- fan-out ---------------------------------------------------------------
function fan(ttMetaName: string, gaName: string, p: Payload) {
  if (!ready()) return;
  const eventID = newId();
  const currency = p.currency || "GBP";
  const value = p.value ?? sum(p.items);
  const items = p.items || [];

  if (PIXELS.tiktok) {
    window.ttq?.track?.(
      ttMetaName,
      {
        contents: items.map((i) => ({
          content_id: i.id,
          content_name: i.name,
          content_type: "product",
          price: i.price,
          quantity: i.quantity ?? 1,
        })),
        value,
        currency,
      },
      { event_id: eventID }
    );
  }

  if (PIXELS.meta) {
    window.fbq?.(
      "track",
      ttMetaName, // ViewContent / AddToCart / InitiateCheckout are shared TikTok+Meta names
      {
        content_ids: items.map((i) => i.id),
        content_type: "product",
        content_name: items[0]?.name,
        contents: items.map((i) => ({ id: i.id, quantity: i.quantity ?? 1, item_price: i.price })),
        value,
        currency,
      },
      { eventID }
    );
  }

  if (PIXELS.ga4) {
    window.gtag?.("event", gaName, {
      currency,
      value,
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
        item_category: i.category,
      })),
    });
  }
}
