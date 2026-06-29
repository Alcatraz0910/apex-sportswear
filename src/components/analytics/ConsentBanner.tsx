// src/components/analytics/ConsentBanner.tsx
// Lightweight, theme-matched consent banner. Default state is "unset" -> shown.
// Accept = grant marketing/analytics; Reject = deny. Choice persists (see consent.ts).
"use client";

import { setConsent } from "@/lib/analytics/consent";

// No props: setConsent() notifies the consent store, and the parent subscribes via
// useSyncExternalStore, so it re-renders (hiding this banner) automatically.
export default function ConsentBanner() {
  const choose = (v: "granted" | "denied") => setConsent(v);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-zinc-300">
          We use cookies for analytics &amp; marketing (TikTok, Meta, Google) to sharpen our drops
          and your experience. Essential cookies always run — the rest are your call.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("denied")}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
          >
            Reject
          </button>
          <button
            onClick={() => choose("granted")}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
