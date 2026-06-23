import type { ApexProduct } from "./types";

// Subcategories are derived from the catalog at build time: competitions from each
// product's `league` field, clubs from `team`. Products with no clean league/team
// (the low-confidence set) simply don't contribute a subcategory — they stay
// reachable via the hub's full listing and search ("where possible").

export interface SubCat {
  slug: string;
  name: string;
  count: number;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents: "Série" -> "serie", "Côte" -> "cote"
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tally(products: ApexProduct[], field: "league" | "team"): SubCat[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const v = p[field];
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ slug: slugify(name), name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Distinct competitions (from `league`) within a set of products. */
export function competitionsOf(products: ApexProduct[]): SubCat[] {
  return tally(products, "league");
}

/** Distinct clubs/teams (from `team`). `minCount` gates page-worthiness so the
 *  long tail of one-off / low-confidence teams doesn't spawn ugly pages. */
export function clubsOf(products: ApexProduct[], minCount = 1): SubCat[] {
  return tally(products, "team").filter((c) => c.count >= minCount);
}

export function findSub(items: SubCat[], slug: string): SubCat | undefined {
  return items.find((i) => i.slug === slug);
}

/** Sort key for "newest" ordering: the start year of a season ("2025/26" -> 2025,
 *  retro "2012" -> 2012, null -> 0 so undated items sort last). */
export function seasonYear(season: string | null): number {
  if (!season) return 0;
  const m = season.match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}
