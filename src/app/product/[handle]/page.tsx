import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllHandles,
  getProductByHandle,
  getRelated,
  formatPrice,
} from "@/lib/catalog";
import { leagueForCategory } from "@/lib/leagues";
import { BuyBox } from "@/components/BuyBox";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { accentVar } from "@/lib/style";

export async function generateStaticParams() {
  return (await getAllHandles()).map((handle) => ({ handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProductByHandle(handle);
  if (!p) return {};
  return {
    title: p.display_title,
    description: p.seo.meta_description,
    alternates: { canonical: `/product/${p.handle}` },
    openGraph: {
      title: p.seo.meta_title,
      description: p.seo.meta_description,
      images: p.images.map((i) => ({ url: i.src })),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  const league = leagueForCategory(product.category);
  const related = await getRelated(product);

  return (
    <div style={league ? accentVar(league.accent) : undefined}>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          ...(league ? [{ name: league.name, url: `/${league.slug}` }] : []),
          { name: product.display_title, url: `/product/${product.handle}` },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-xs text-muted">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {league && (
            <>
              {" / "}
              <Link href={`/${league.slug}`} className="hover:text-foreground">
                {league.name}
              </Link>
            </>
          )}
          {product.team && (
            <>
              {" / "}
              <span className="text-foreground">{product.team}</span>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery
            images={product.images}
            title={product.display_title}
            edition={product.edition}
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              {[product.team, product.season].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold uppercase leading-tight sm:text-4xl">
              {product.display_title}
            </h1>
            <p className="mt-4 font-mono text-2xl text-accent">
              {formatPrice(product.price, product.currency)}
            </p>
            <div
              className="mt-6 text-sm leading-relaxed text-muted [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: product.description_html }}
            />
            <div className="mt-8">
              <BuyBox product={product} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 font-display text-2xl font-extrabold uppercase">
              You might also like
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
