"use client";

import { useState } from "react";

// Mock email capture — wire to Shopify customer create + Shopify Email later (Phase 4).
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="text-sm font-medium text-accent">
        You&apos;re in — welcome to the Apex Club. 🎉
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email) setDone(true);
      }}
      className="flex gap-2"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black"
      >
        Join
      </button>
    </form>
  );
}
