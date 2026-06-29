// src/lib/analytics/consent.ts
// Single source of truth for marketing/analytics consent. Default = DENIED.
// Nothing fires until the visitor accepts (UK PECR / GDPR-safe). SSR-safe.

export type ConsentValue = "granted" | "denied" | "unset";
const KEY = "apex_consent_v1";
const listeners = new Set<(v: ConsentValue) => void>();

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return "unset";
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function setConsent(v: Exclude<ConsentValue, "unset">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, v);
    // 1st-party cookie too, so the edge / Shopify side can read the same choice
    document.cookie = `${KEY}=${v}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  } catch {}
  listeners.forEach((fn) => fn(v));
}

export function onConsentChange(fn: (v: ConsentValue) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
