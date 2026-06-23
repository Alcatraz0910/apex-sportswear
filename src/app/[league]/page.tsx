import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LEAGUES, getLeague } from "@/lib/leagues";
import { getProductsByCategories } from "@/lib/catalog";
import { competitionsOf, clubsOf } from "@/lib/subcategories";
import { ProductExplorer } from "@/components/ProductExplorer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { accentVar } from "@/lib/style";

export function generateStaticParams() {
  return LEAGUES.map((l) => ({ league: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ league: string }>;
}): Promise<Metadata> {
  const { league } = await params;
  const l = getLeague(league);
  if (!l) return {};
  return {
    title: `${l.name} Kits & Gear`,
    description: l.blurb,
    alternates: { canonical: `/${l.slug}` },
    openGraph: {
      title: `${l.name} Kits & Gear | Apex Sportswear`,
      description: l.blurb,
    },
  };
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const { league } = await params;
  const l = getLeague(league);
  if (!l) notFound();

  const products = await getProductsByCategories(l.categories);
  const competitions = competitionsOf(products);
  const clubs = clubsOf(products, 2).slice(0, 14);

  return (
    <div style={accentVar(l.accent)}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: l.name, url: `/${l.slug}` },
        ]}
      />

      <section className="accent-glow border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            {l.tagline}
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold uppercase sm:text-6xl">
            {l.name}
          </h1>
          <p className="mt-3 max-w-xl text-muted">{l.blurb}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {competitions.length > 1 && (
          <div className="mb-14">
            <h2 className="mb-5 font-display text-2xl font-extrabold uppercase">
              Competitions
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {competitions.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${l.slug}/${c.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent"
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-xs text-muted group-hover:text-accent">
                    {c.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {clubs.length > 0 && (
          <div className="mb-14">
            <h2 className="mb-5 font-display text-2xl font-extrabold uppercase">
              Popular clubs &amp; countries
            </h2>
            <div className="flex flex-wrap gap-2">
              {clubs.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${l.slug}/club/${c.slug}`}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  {c.name}{" "}
                  <span className="text-xs text-muted/70">{c.count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-6 font-display text-2xl font-extrabold uppercase">
          All {l.name}
        </h2>
        {products.length ? (
          <ProductExplorer products={products} />
        ) : (
          <p className="text-muted">No products yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
