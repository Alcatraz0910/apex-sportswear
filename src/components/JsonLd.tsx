import type { ApexProduct } from "@/lib/types";

const SITE = "https://apexsportswear.com";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Apex Sportswear",
        url: SITE,
        slogan: "Wear Your Allegiance",
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Apex Sportswear",
        url: SITE,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: ApexProduct }) {
  const inStock = product.variants.some((v) => v.available);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.display_title,
        image: product.images.map((i) => i.src),
        description: product.seo.meta_description,
        brand: { "@type": "Brand", name: product.team },
        category: product.category,
        offers: {
          "@type": "Offer",
          priceCurrency: product.currency,
          price: product.price.toFixed(2),
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${SITE}/product/${product.handle}`,
        },
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.q,
          acceptedAnswer: { "@type": "Answer", text: it.a },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: `${SITE}${it.url}`,
        })),
      }}
    />
  );
}
