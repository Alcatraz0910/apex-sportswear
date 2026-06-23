"use client";

import { useState } from "react";

// Mock contact form — wire to an email/inbox provider or Shopify contact later.
export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="rounded-2xl border border-accent/40 bg-card p-4 text-sm text-accent">
        Thanks — your message is on its way. We&apos;ll get back to you shortly.
      </p>
    );
  }

  const field =
    "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4"
    >
      <input required type="text" placeholder="Your name" className={field} />
      <input required type="email" placeholder="Your email" className={field} />
      <textarea
        required
        rows={5}
        placeholder="How can we help?"
        className={field}
      />
      <button className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black">
        Send message
      </button>
    </form>
  );
}
