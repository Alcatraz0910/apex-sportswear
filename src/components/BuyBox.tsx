"use client";

import { useState } from "react";
import type { ApexProduct } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { SizeGuide } from "./SizeGuide";
import playersData from "@/data/players.json";

const PLAYERS = playersData as Record<string, { name: string; number: string }[]>;
// Public variant id of the £4.99 "Shirt Personalisation" add-on (not secret — safe to inline).
const PERSONALISATION_VARIANT_ID =
  process.env.NEXT_PUBLIC_PERSONALISATION_VARIANT_ID ||
  "gid://shopify/ProductVariant/54221595705671";
const PERSONALISATION_FEE = 4.99;

// Personalisation is for football shirts only (NBA jerseys are player-specific; F1 excluded).
const CUSTOMISABLE = new Set(["football-club", "national-team"]);

export function BuyBox({ product }: { product: ApexProduct }) {
  const firstAvailable = product.variants.find((v) => v.available)?.size ?? null;
  const [size, setSize] = useState<string | null>(firstAvailable);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  const canCustomise = CUSTOMISABLE.has(product.category);
  const roster = PLAYERS[product.team] ?? [];
  const [personalise, setPersonalise] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  const fitNote = (product.edition ?? "").toLowerCase().includes("player")
    ? "Player Version — a tight, athletic fit, just like the players wear. Prefer a relaxed fit? Size up."
    : undefined;

  const selectedVariant = product.variants.find((v) => v.size === size);
  const custom = personalise && (name.trim() !== "" || number.trim() !== "");
  const total = product.price + (custom ? PERSONALISATION_FEE : 0);

  const pickPlayer = (value: string) => {
    const p = roster.find((r) => `${r.name}|${r.number}` === value);
    if (p) {
      setName(p.name);
      setNumber(p.number);
    }
  };

  const handleAdd = async () => {
    if (!size || !selectedVariant?.id || adding) return;
    setAdding(true);
    try {
      const lines = [
        {
          merchandiseId: selectedVariant.id,
          quantity: 1,
          attributes: custom
            ? [
                { key: "Name", value: name.trim().toUpperCase() || "—" },
                { key: "Number", value: number.trim() || "—" },
              ]
            : [],
        },
      ];
      if (custom) {
        lines.push({ merchandiseId: PERSONALISATION_VARIANT_ID, quantity: 1, attributes: [] });
      }
      await addToCart(lines);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
        Size
      </p>
      <div className="flex flex-wrap gap-2">
        {product.variants.map((v) => (
          <button
            key={v.size}
            disabled={!v.available}
            onClick={() => setSize(v.size)}
            className={`min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              size === v.size
                ? "border-accent bg-accent text-black"
                : "border-border text-foreground hover:border-accent"
            } ${!v.available ? "cursor-not-allowed text-muted line-through opacity-40" : ""}`}
          >
            {v.size}
          </button>
        ))}
      </div>

      {product.size_chart && <SizeGuide chart={product.size_chart} fitNote={fitNote} />}

      {/* Personalisation — football shirts only */}
      {canCustomise && (
        <div className="mt-6 rounded-2xl border border-border p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-semibold">
              Add name &amp; number
              <span className="ml-2 font-mono text-accent">
                +{formatPrice(PERSONALISATION_FEE, product.currency)}
              </span>
            </span>
            <input
              type="checkbox"
              checked={personalise}
              onChange={(e) => setPersonalise(e.target.checked)}
              className="h-5 w-5 accent-[var(--accent,#00e676)]"
            />
          </label>

          {personalise && (
            <div className="mt-4 space-y-3">
              {roster.length > 0 && (
                <select
                  onChange={(e) => pickPlayer(e.target.value)}
                  defaultValue=""
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                >
                  <option value="">Pick a player…</option>
                  {roster.map((p) => (
                    <option key={`${p.name}|${p.number}`} value={`${p.name}|${p.number}`}>
                      {p.name} {p.number && `#${p.number}`}
                    </option>
                  ))}
                  <option value="">— or enter your own below —</option>
                </select>
              )}
              <div className="flex gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 15))}
                  placeholder="NAME"
                  maxLength={15}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase tracking-wide"
                />
                <input
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="No."
                  inputMode="numeric"
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2.5 text-center text-sm"
                />
              </div>
              <p className="text-xs text-muted">
                Personalised shirts add <strong className="text-foreground">2–5 days</strong> to delivery.
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!size || adding || !selectedVariant?.id}
        className="mt-6 w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {adding
          ? "Adding…"
          : size
            ? `Add to bag — ${formatPrice(total, product.currency)}`
            : "Select a size"}
      </button>

      <p className="mt-3 text-center text-xs text-muted">
        Secure checkout · 14-day returns
      </p>
    </div>
  );
}
