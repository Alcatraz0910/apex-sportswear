import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { LeagueHubs } from "@/components/LeagueHubs";
import { ProductGrid } from "@/components/ProductGrid";
import { getFeatured } from "@/lib/catalog";

export default async function Home() {
  const featured = await getFeatured(8);
  return (
    <>
      <Hero />
      <Marquee />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
            Featured drops
          </h2>
          <Link href="/football" className="text-sm font-semibold text-accent">
            View all →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 font-display text-3xl font-extrabold uppercase sm:text-4xl">
          Shop by league
        </h2>
        <LeagueHubs />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="accent-glow relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Apex Club
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold uppercase sm:text-5xl">
            Be first to every drop.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Join the Apex Club free for early access to new kits, members-only
            offers and restock alerts — straight to your inbox.
          </p>
          <Link
            href="/apex-club"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-black"
          >
            Join the Apex Club
          </Link>
        </div>
      </section>
    </>
  );
}
