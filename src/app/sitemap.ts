import type { MetadataRoute } from "next";
import { getAllProducts, getProductsByCategories } from "@/lib/catalog";
import { LEAGUES } from "@/lib/leagues";
import { competitionsOf, clubsOf } from "@/lib/subcategories";

const SITE = "https://apexsportswear.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ["", "/apex-club", "/faq", "/contact"].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
  }));
  const leagueRoutes = LEAGUES.map((l) => ({
    url: `${SITE}/${l.slug}`,
    lastModified: now,
  }));
  const subRoutes: MetadataRoute.Sitemap = [];
  for (const l of LEAGUES) {
    const ps = await getProductsByCategories(l.categories);
    for (const c of competitionsOf(ps)) {
      subRoutes.push({ url: `${SITE}/${l.slug}/${c.slug}`, lastModified: now });
    }
    for (const c of clubsOf(ps, 2)) {
      subRoutes.push({ url: `${SITE}/${l.slug}/club/${c.slug}`, lastModified: now });
    }
  }
  const productRoutes = (await getAllProducts()).map((p) => ({
    url: `${SITE}/product/${p.handle}`,
    lastModified: now,
  }));
  return [
    ...staticRoutes,
    ...leagueRoutes,
    ...subRoutes,
    ...productRoutes,
  ];
}
