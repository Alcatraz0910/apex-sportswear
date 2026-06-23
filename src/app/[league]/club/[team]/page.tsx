import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LEAGUES, getLeague } from "@/lib/leagues";
import { getProductsByCategories } from "@/lib/catalog";
import { clubsOf, findSub } from "@/lib/subcategories";
import { ProductExplorer } from "@/components/ProductExplorer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { accentVar } from "@/lib/style";

// Pages are generated for clubs with >= 2 products; the long tail of one-off /
// low-confidence teams stays reachable via the hub listing + search.
export async function generateStaticParams() {
  const out: { league: string; team: string }[] = [];
  for (const l of LEAGUES) {
    const products = await getProductsByCategories(l.categories);
    for (const c of clubsOf(products, 2)) {
      out.push({ league: l.slug, team: c.slug });
    }
  }
  return out;
}

async function resolve(league: string, team: string) {
  const l = getLeague(league);
  if (!l) return null;
  const products = await getProductsByCategories(l.categories);
  const club = findSub(clubsOf(products, 1), team);
  if (!club) return null;
  return { l, club, items: products.filter((p) => p.team === club.name) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ league: string; team: string }>;
}): Promise<Metadata> {
  const { league, team } = await params;
  const r = await resolve(league, team);
  if (!r) return {};
  const title = `${r.club.name} Shirts & Kits`;
  return {
    title,
    description: `Shop ${r.club.name} football shirts and kits at Apex Sportswear.`,
    alternates: { canonical: `/${r.l.slug}/club/${team}` },
    openGraph: { title: `${title} | Apex Sportswear` },
  };
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ league: string; team: string }>;
}) {
  const { league, team } = await params;
  const r = await resolve(league, team);
  if (!r) notFound();
  const { l, club, items } = r;

  return (
    <div style={accentVar(l.accent)}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: l.name, url: `/${l.slug}` },
          { name: club.name, url: `/${l.slug}/club/${club.slug}` },
        ]}
      />

      <section className="accent-glow border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <nav className="mb-4 text-xs text-muted">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {" / "}
            <Link href={`/${l.slug}`} className="hover:text-foreground">
              {l.name}
            </Link>
            {" / "}
            <span className="text-foreground">{club.name}</span>
          </nav>
          <h1 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">
            {club.name}
          </h1>
          <p className="mt-3 text-muted">
            {club.count} {club.count === 1 ? "kit" : "kits"} available.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ProductExplorer products={items} />
      </section>
    </div>
  );
}
