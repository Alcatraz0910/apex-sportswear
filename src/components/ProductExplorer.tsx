"use client";

import { useMemo, useState } from "react";
import type { ApexProduct } from "@/lib/types";
import { seasonYear } from "@/lib/subcategories";
import { ProductCard } from "./ProductCard";

function uniq(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort();
}

const SORTS = [
  { id: "newest", label: "Newest (season)" },
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

export function ProductExplorer({ products }: { products: ApexProduct[] }) {
  const competitions = uniq(products.map((p) => p.league));
  const teams = uniq(products.map((p) => p.team));
  const kits = uniq(products.map((p) => p.kit_type));
  const [competition, setCompetition] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);
  const [kit, setKit] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let r = products.filter(
      (p) =>
        (!competition || p.league === competition) &&
        (!team || p.team === team) &&
        (!kit || p.kit_type === kit),
    );
    if (sort === "newest")
      r = [...r].sort((a, b) => seasonYear(b.season) - seasonYear(a.season));
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [products, competition, team, kit, sort]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "border-accent bg-accent text-black"
        : "border-border text-muted hover:text-foreground"
    }`;

  const selectCls =
    "rounded-full border border-border bg-background px-4 py-2 text-xs text-foreground outline-none focus:border-accent";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        {kits.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setKit(null)} className={chip(!kit)}>
              All kits
            </button>
            {kits.map((k) => (
              <button key={k} onClick={() => setKit(k)} className={chip(kit === k)}>
                {k}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {competitions.length > 1 && (
            <select
              value={competition ?? ""}
              onChange={(e) => setCompetition(e.target.value || null)}
              aria-label="Filter by competition"
              className={selectCls}
            >
              <option value="">All competitions</option>
              {competitions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {teams.length > 1 && (
            <select
              value={team ?? ""}
              onChange={(e) => setTeam(e.target.value || null)}
              aria-label="Filter by club or country"
              className={selectCls}
            >
              <option value="">All clubs &amp; countries</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className={`${selectCls} ml-auto`}
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-6 text-sm text-muted">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No products match those filters.</p>
      )}
    </div>
  );
}
