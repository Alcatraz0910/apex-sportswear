"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

type Status = "idle" | "loading" | "done" | "error";

export function ApexClubSignup() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  const verified = params.get("verified");
  const [email, setEmail] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [refLink, setRefLink] = useState("");
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/apex-club/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tiktok, ref }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong — please try again.");
        return;
      }
      setMessage(data.message || "Check your email to confirm.");
      if (data.referralPath) {
        setRefLink(
          typeof window !== "undefined"
            ? window.location.origin + data.referralPath
            : data.referralPath,
        );
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  if (verified === "1") {
    return (
      <p className="text-sm font-medium text-accent">
        🎉 Email confirmed — you&apos;re in the draw! Winners are announced live on TikTok.
      </p>
    );
  }

  if (status === "done") {
    return (
      <div className="text-left">
        <p className="text-sm font-medium text-accent">🎉 {message}</p>
        {refLink && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Your referral link
            </p>
            <p className="mt-1 text-xs text-muted">
              Share it — every friend who joins &amp; confirms earns you a bonus draw entry.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                readOnly
                value={refLink}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-2 text-xs"
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(refLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="shrink-0 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-black"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-left">
      {verified === "0" && (
        <p className="mb-3 text-xs text-red-400">
          That confirmation link is invalid or expired — please sign up again below.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      <input
        type="text"
        value={tiktok}
        onChange={(e) => setTiktok(e.target.value)}
        placeholder="Your TikTok @handle (optional — for the draw)"
        className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
      />
      {ref && (
        <p className="px-1 text-xs text-accent">
          Referred by a friend — you&apos;ll both earn a bonus entry. 🙌
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
      >
        {status === "loading" ? "Joining…" : "Join the Apex Club"}
      </button>
      {status === "error" && <p className="px-1 text-xs text-red-400">{message}</p>}
      <p className="px-1 text-xs text-muted">
        Free to join. Confirm your email (check your junk/spam folder too) to activate
        your free prize-draw entry. No purchase necessary.
      </p>
      </form>
    </div>
  );
}
