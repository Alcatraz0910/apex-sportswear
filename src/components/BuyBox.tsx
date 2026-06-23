"use client";

import { useState } from "react";
import type { ApexProduct } from "@/lib/types";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { SizeGuide } from "./SizeGuide";

export function BuyBox({ product }: { product: ApexProduct }) {
  const firstAvailable = product.variants.find((v) => v.available)?.size ?? null;
  const [size, setSize] = useState<string | null>(firstAvailable);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();

  const fitNote = (product.edition ?? "").toLowerCase().includes("player")
    ? "Player Version — a tight, athletic fit, just like the players wear. Prefer a relaxed fit? Size up."
    : undefined;

  const selectedVariant = product.variants.find((v) => v.size === size);

  const handleAdd = async () => {
    if (!size || !selectedVariant?.id) return;
    setAdding(true);
    try {
      await addToCart(selectedVariant.id);
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

      <button
        onClick={handleAdd}
        disabled={!size || adding || !selectedVariant?.id}
        className="mt-6 w-full rounded-full bg-accent px-6 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {adding
          ? "Adding…"
          : size
            ? `Add to bag — ${formatPrice(product.price, product.currency)}`
            : "Select a size"}
      </button>

      <p className="mt-3 text-center text-xs text-muted">
        Secure checkout · 14-day returns
      </p>
    </div>
  );
}
