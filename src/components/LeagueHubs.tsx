import Link from "next/link";
import { LEAGUES } from "@/lib/leagues";
import { accentVar } from "@/lib/style";

export function LeagueHubs() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {LEAGUES.map((l) => (
        <Link
          key={l.slug}
          href={`/${l.slug}`}
          style={accentVar(l.accent)}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-colors hover:border-accent"
        >
          <div className="accent-glow pointer-events-none absolute inset-x-0 top-0 h-32 opacity-0 transition-opacity group-hover:opacity-100" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            {l.tagline}
          </p>
          <h3 className="mt-3 font-display text-3xl font-extrabold uppercase">
            {l.name}
          </h3>
          <p className="mt-2 text-sm text-muted">{l.blurb}</p>
          <span className="mt-6 inline-block text-sm font-semibold text-foreground">
            Shop {l.name} →
          </span>
        </Link>
      ))}
    </div>
  );
}
