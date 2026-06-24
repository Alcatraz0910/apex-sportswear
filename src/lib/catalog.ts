import type { ApexProduct, Category, Variant } from "./types";
import { adminGraphQL, shopifyConfigured } from "./shopify";
import { seasonYear } from "./subcategories";
import { sizeChartFor } from "./sizeChart";
import productsData from "@/data/products.json";

// Data-access seam.
//
// Commerce truth (which products exist, price, variants, availability, status) comes
// LIVE from the Shopify Admin API — drafts included, since the Storefront API can't see
// drafts during the build phase. Display attributes Shopify doesn't store yet
// (team/league/season/kit_type/sleeve/edition/size_chart) and product images come from
// the bundled reviewed catalog, merged by handle. INTERIM: at go-live those move into
// Shopify (metafields + hosted media) and this merge + the bundle go away.
//
// If Shopify is unconfigured or unreachable, we fall back to the bundle so the build
// and storefront still work.

const BUNDLE = productsData as ApexProduct[];
const BUNDLE_BY_HANDLE = new Map(BUNDLE.map((p) => [p.handle, p]));

const PLACEHOLDER_IMG = {
  src: "https://placehold.co/800x800?text=Apex+Sportswear",
  alt: "Apex Sportswear",
};

interface ShopifyVariantNode {
  id: string;
  title: string;
  sku: string | null;
  price: string | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}
interface ShopifyProductNode {
  handle: string;
  title: string;
  status: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  seo: { title: string | null; description: string | null };
  priceRangeV2: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { nodes: ShopifyVariantNode[] };
}

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 100, after: $cursor, sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      nodes {
        handle
        title
        status
        descriptionHtml
        productType
        tags
        seo { title description }
        priceRangeV2 { minVariantPrice { amount currencyCode } }
        variants(first: 15) {
          nodes { id title sku price availableForSale selectedOptions { name value } }
        }
      }
    }
  }
`;

interface ProductsPage {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string };
    nodes: ShopifyProductNode[];
  };
}

async function fetchAllShopifyProducts(): Promise<ShopifyProductNode[]> {
  const all: ShopifyProductNode[] = [];
  let cursor: string | null = null;
  for (;;) {
    const data: ProductsPage = await adminGraphQL<ProductsPage>(PRODUCTS_QUERY, {
      cursor,
    });
    all.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return all;
}

function mapShopify(node: ShopifyProductNode, enrich?: ApexProduct): ApexProduct {
  const variants: Variant[] = node.variants.nodes.map((v) => ({
    id: v.id,
    size: v.selectedOptions.find((o) => o.name === "Size")?.value || v.title || "One Size",
    sku: v.sku || null,
    price: v.price != null ? Number.parseFloat(v.price) : null,
    available: Boolean(v.availableForSale),
  }));
  const minAmount = Number.parseFloat(node.priceRangeV2?.minVariantPrice?.amount ?? "");
  const images = enrich?.images?.length ? enrich.images : [PLACEHOLDER_IMG];

  return {
    display_title: node.title,
    handle: node.handle,
    // enrichment from the bundle (Shopify doesn't store these yet):
    team: enrich?.team ?? node.title,
    league: enrich?.league ?? null,
    category: enrich?.category ?? ((node.productType as Category) || "other"),
    season: enrich?.season ?? null,
    kit_type: enrich?.kit_type ?? null,
    sleeve: enrich?.sleeve ?? "short",
    edition: enrich?.edition ?? null,
    audience: enrich?.audience ?? null,
    garment: enrich?.garment ?? null,
    size_chart: enrich?.size_chart ?? sizeChartFor(variants.map((v) => v.size)),
    // commerce truth from Shopify:
    description_html: node.descriptionHtml || enrich?.description_html || "",
    tags: node.tags?.length ? node.tags : (enrich?.tags ?? []),
    price: Number.isFinite(minAmount) ? minAmount : (enrich?.price ?? 0),
    currency: node.priceRangeV2?.minVariantPrice?.currencyCode ?? enrich?.currency ?? "GBP",
    variants: variants.length ? variants : (enrich?.variants ?? []),
    images,
    seo: {
      meta_title: node.seo?.title || enrich?.seo?.meta_title || `${node.title} | Apex Sportswear`,
      meta_description: node.seo?.description || enrich?.seo?.meta_description || "",
    },
    source: enrich?.source ?? { supplier: "shopify", raw_title: node.title },
    confidence: enrich?.confidence ?? 1,
    status: node.status === "ACTIVE" ? "active" : "draft",
  };
}

// Fetched once per process (build or server runtime) and memoized, so generating
// ~410 static pages triggers a single Shopify fetch instead of one per page.
let catalogPromise: Promise<ApexProduct[]> | null = null;

async function loadCatalog(): Promise<ApexProduct[]> {
  if (!shopifyConfigured) return BUNDLE;
  try {
    const nodes = await fetchAllShopifyProducts();
    if (!nodes.length) return BUNDLE;
    // Hide non-product add-ons (e.g. the £4.99 personalisation line item) from the catalogue.
    const real = nodes.filter(
      (n) =>
        n.handle !== "shirt-personalisation" &&
        n.productType !== "addon" &&
        !(n.tags ?? []).includes("_addon"),
    );
    return real.map((n) => mapShopify(n, BUNDLE_BY_HANDLE.get(n.handle)));
  } catch (err) {
    console.error("[catalog] Shopify fetch failed; falling back to bundled data:", err);
    return BUNDLE;
  }
}

function getCatalog(): Promise<ApexProduct[]> {
  if (!catalogPromise) catalogPromise = loadCatalog();
  return catalogPromise;
}

export async function getAllProducts(): Promise<ApexProduct[]> {
  return getCatalog();
}

export async function getAllHandles(): Promise<string[]> {
  return (await getCatalog()).map((p) => p.handle);
}

export async function getProductByHandle(handle: string): Promise<ApexProduct | undefined> {
  return (await getCatalog()).find((p) => p.handle === handle);
}

export async function getProductsByCategories(categories: Category[]): Promise<ApexProduct[]> {
  return (await getCatalog()).filter((p) => categories.includes(p.category));
}

export async function getFeatured(limit = 8): Promise<ApexProduct[]> {
  // "Recently added" proxy: newest by season (we have no per-product added-date).
  return [...(await getCatalog())]
    .sort((a, b) => seasonYear(b.season) - seasonYear(a.season))
    .slice(0, limit);
}

export async function getRelated(product: ApexProduct, limit = 4): Promise<ApexProduct[]> {
  return (await getCatalog())
    .filter((p) => p.handle !== product.handle && p.category === product.category)
    .slice(0, limit);
}

export function formatPrice(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
}

// Request an appropriately-sized image from Shopify's CDN (it resizes on the fly via
// ?width=). Keeps payloads small + crisp without Vercel's optimizer. No-op for non-Shopify
// URLs (supplier-CDN fallbacks), so it's always safe to call.
export function sizedImg(src: string, width: number): string {
  if (!src || !src.includes("cdn.shopify.com")) return src;
  return src.includes("?") ? `${src}&width=${width}` : `${src}?width=${width}`;
}
