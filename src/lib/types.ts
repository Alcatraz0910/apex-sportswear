// Canonical product shape — mirrors data/product-schema.json (the pipeline output).
// When Shopify is connected, the Storefront API response is mapped into this shape so
// the UI never changes.

export type Category =
  | "football-club"
  | "national-team"
  | "nba"
  | "f1"
  | "training"
  | "other";

export interface Variant {
  id?: string; // Shopify variant GID — needed for cartCreate/cartLinesAdd
  size: string;
  sku: string | null;
  price: number | null;
  available: boolean;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductSEO {
  meta_title: string;
  meta_description: string;
}

export interface ProductSource {
  supplier: string;
  raw_title: string;
  source_url?: string;
  supplier_handle?: string;
}

export interface SizeChart {
  // Size charts are scraped from the supplier product page (a measurements table
  // and/or an image). Either or both may be present.
  table?: { columns: string[]; rows: string[][] };
  image?: string;
  source?: string; // supplier origin (audit only — not shown to customers)
}

export interface ApexProduct {
  display_title: string;
  handle: string;
  team: string;
  league: string | null;
  category: Category;
  season: string | null;
  kit_type: string | null;
  sleeve: "short" | "long";
  edition: string | null;
  audience: string | null;
  garment: string | null;
  size_chart?: SizeChart | null;
  description_html: string;
  tags: string[];
  price: number;
  currency: string;
  variants: Variant[];
  images: ProductImage[];
  seo: ProductSEO;
  source: ProductSource;
  confidence: number;
  status: "draft" | "active";
}
