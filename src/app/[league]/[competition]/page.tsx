import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LEAGUES, getLeague } from "@/lib/leagues";
import { getProductsByCategories } from "@/lib/catalog";
import { competitionsOf, findSub } from "@/lib/subcategories";
import { ProductExplorer } from "@/components/ProductExplorer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { accentVar } from "@/lib/style";

export async function generateStaticParams() {
  const out: { league: string; competition: string }[] = [];
  for (const l of LEAGUES) {
    const products = await getProductsByCategories(l.categories);
    for (const c of competitionsOf(products)) {
      out.push({ league: l.slug, competition: c.slug });
    }
  }
  return out;
}

async function resolve(league: string, competition: string) {
  const l = getLeague(league);
  if (!l) return null;
  const products = await getProductsByCategories(l.categories);
  const comp = findSub(competitionsOf(products), competition);
  if (!comp) return null;
  return { l, comp, items: products.filter((p) => p.league === comp.name) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ league: string; competition: string }>;
}): Promise<Metadata> {
  const { league, competition } = await params;
  const r = await resolve(league, competition);
  if (!r) return {};
  const title = `${r.comp.name} Shirts & Kits`;
  return {
    title,
    description: `Shop ${r.comp.name} football shirts and kits at Apex Sportswear.`,
    alternates: { canonical: `/${r.l.slug}/${competition}` },
    openGraph: { title: `${title} | Apex Sportswear` },
  };
}

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ league: string; competition: string }>;
}) {
  const { league, competition } = await params;
  const r = await resolve(league, competition);
  if (!r) notFound();
  const { l, comp, items } = r;

  return (
    <div style={accentVar(l.accent)}>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: l.name, url: `/${l.slug}` },
          { name: comp.name, url: `/${l.slug}/${comp.slug}` },
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
            <span className="text-foreground">{comp.name}</span>
          </nav>
          <h1 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">
            {comp.name}
          </h1>
          <p className="mt-3 text-muted">
            {comp.count} {comp.count === 1 ? "kit" : "kits"} in {l.name}.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ProductExplorer products={items} />
      </section>
    </div>
  );
}
