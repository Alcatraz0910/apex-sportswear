import type { Metadata } from "next";
import Link from "next/link";
import { FaqJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Apex Sportswear — shipping, returns, sizing, payment and the Apex Club.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Orders are processed within 1–3 business days. As some items ship directly from our suppliers, delivery times vary by product and region — the estimate is shown at checkout, and you'll get tracking once it ships.",
  },
  {
    q: "What is your returns policy?",
    a: "You can cancel within 14 days of receiving your order and return items (unused, with tags) within 14 days of telling us. Faulty or incorrect items are returned at our cost. See our Returns & Refunds policy for full details.",
  },
  {
    q: "How do I choose the right size?",
    a: "Every product page has a Size Guide with measurements taken from the supplier. If you're between sizes, we recommend sizing up.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "All major cards and the express wallets supported at checkout. Payments are processed securely — we never store your full card details.",
  },
  {
    q: "What is the Apex Club?",
    a: "It's our free members' list. Join with your email for early access to new drops, members-only offers and restock alerts.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <FaqJsonLd items={FAQS} />
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
        Help
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase">
        Frequently asked questions
      </h1>

      <div className="mt-10 divide-y divide-border border-y border-border">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="cursor-pointer list-none font-display text-lg font-bold uppercase tracking-wide marker:content-none">
              {f.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        Still need help?{" "}
        <Link href="/contact" className="text-accent underline-offset-4 hover:underline">
          Contact us →
        </Link>
      </p>
    </div>
  );
}
