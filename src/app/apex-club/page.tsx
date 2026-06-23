import type { Metadata } from "next";
import { Suspense } from "react";
import { ApexClubSignup } from "@/components/ApexClubSignup";

export const metadata: Metadata = {
  title: "Apex Club — Win a Free Shirt",
  description:
    "Join the Apex Club free, confirm your email and you're entered to win a free football shirt — drawn live on TikTok. Earn extra entries by following us, referring friends and shopping.",
  alternates: { canonical: "/apex-club" },
};

const ENTRIES = [
  {
    title: "Confirm your email",
    body: "Join free and verify your email — that's your first prize-draw entry. No purchase necessary.",
    tag: "+1 entry",
  },
  {
    title: "Follow on TikTok",
    body: "Follow @apex.sportswear6 so you can watch the draw live — and bag a bonus entry.",
    tag: "+1 entry",
  },
  {
    title: "Refer friends",
    body: "Share your referral link. Every friend who joins and confirms earns you another entry.",
    tag: "+1 each",
  },
  {
    title: "Shop shirts",
    body: "Once we're live, every shirt you buy adds an entry — buy 2, get 2 (it's 11-a-side, after all).",
    tag: "+1 / shirt",
  },
];

const PERKS = [
  { title: "Early access", body: "Shop new kits and limited drops before everyone else." },
  { title: "Members-only offers", body: "Exclusive discounts and promos, straight to your inbox." },
  { title: "Restock alerts", body: "Be first to know when sold-out sizes come back." },
  { title: "Free-shirt draws", body: "Members are entered to win a free shirt, drawn live on TikTok." },
];

export default function ApexClubPage() {
  return (
    <>
      <section className="accent-glow border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Apex Club
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-extrabold uppercase sm:text-6xl">
            Join free. Win a free shirt.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Join the Apex Club, confirm your email and you&apos;re entered to win a free
            football shirt — drawn live on TikTok. Earn more entries by following us,
            referring friends and shopping.
          </p>
          <p className="mx-auto mt-5 inline-block rounded-full border border-accent/40 px-4 py-1.5 text-sm font-semibold text-accent">
            🗓️ Next draw: 30 July 2026 — live on TikTok
          </p>
          <div className="mx-auto mt-8 max-w-sm">
            <Suspense fallback={null}>
              <ApexClubSignup />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-display text-3xl font-extrabold uppercase">
          How the draw works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENTRIES.map((e) => (
            <div key={e.title} className="rounded-3xl border border-border bg-card p-6">
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">
                {e.tag}
              </span>
              <h3 className="mt-3 font-display text-xl font-extrabold uppercase">
                {e.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{e.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          No purchase necessary to enter or win. Winners are drawn at random from all
          entries and announced live on TikTok. UK 18+. Full terms apply.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="mb-8 font-display text-3xl font-extrabold uppercase">
          Member perks
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-extrabold uppercase text-accent">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
