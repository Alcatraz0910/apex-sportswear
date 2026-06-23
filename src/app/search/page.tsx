import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false }, // search result pages shouldn't be indexed
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const all = await getAllProducts();
  const results = query
    ? all.filter((p) =>
        [p.display_title, p.team, p.league ?? "", ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold uppercase">Search</h1>

      <form action="/search" className="mt-6 flex max-w-xl gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search teams, kits, leagues…"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-accent"
        />
        <button className="shrink-0 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black">
          Search
        </button>
      </form>

      {query && (
        <p className="mt-6 text-sm text-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
        </p>
      )}

      <div className="mt-8">
        {results.length ? (
          <ProductGrid products={results} />
        ) : query ? (
          <p className="text-muted">
            No matches.{" "}
            <Link href="/football" className="text-accent">
              Browse football →
            </Link>
          </p>
        ) : (
          <p className="text-muted">Type a team, league or kit to search.</p>
        )}
      </div>
    </div>
  );
}
