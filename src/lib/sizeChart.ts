import type { SizeChart } from "./types";

// Refined size charts. The ADULT figures are the suppliers' own measurements
// (consistent across their catalogue), reformatted into a clean table. The suppliers
// reuse the adult chart on kids listings and give no youth measurements, so KIDS uses
// a standard youth-kit guide keyed to the numeric sizes (16–28). A 1–2cm manual-
// measurement tolerance applies (shown by the SizeGuide component).

const ADULT: SizeChart = {
  table: {
    // Garment measurements are the suppliers' figures minus 2cm (closer to true).
    columns: ["Size", "Fits height (cm)", "Chest Width (cm)", "Length (cm)"],
    rows: [
      ["S", "165–170", "48", "67"],
      ["M", "170–175", "51", "73"],
      ["L", "175–180", "53", "76"],
      ["XL", "180–185", "55", "80"],
      ["XXL", "185–190", "58", "82"],
    ],
  },
  source: "supplier-standard",
};

const KIDS: SizeChart = {
  table: {
    columns: ["Size", "Age (yrs)", "Height (cm)"],
    rows: [
      ["16", "3–4", "98–104"],
      ["18", "5–6", "110–116"],
      ["20", "7–8", "122–128"],
      ["22", "9–10", "134–140"],
      ["24", "11–12", "146–152"],
      ["26", "13", "158–164"],
      ["28", "14", "164–170"],
    ],
  },
  source: "youth-standard",
};

/** Pick the right refined chart from a product's sizes: numeric sizes => kids,
 *  lettered sizes => adult. Returns null for one-off/unknown sizing. */
export function sizeChartFor(sizes: string[]): SizeChart | null {
  if (sizes.some((s) => /^\d{1,2}$/.test(s.trim()))) return KIDS;
  if (sizes.some((s) => /^(xs|s|m|l|xl|xxl|xxxl|[2-5]xl)$/i.test(s.trim()))) return ADULT;
  return null;
}
