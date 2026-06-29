// src/components/analytics/ProductViewTracker.tsx
// Tiny client component dropped onto the (server-rendered) product page so we can
// fire a `view_content` once the PDP mounts. No-op until consent is granted.
"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics/track";

export default function ProductViewTracker({
  id,
  name,
  price,
  currency,
  category,
}: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}) {
  useEffect(() => {
    trackViewContent({
      items: [{ id, name, price, category }],
      value: price,
      currency,
    });
  }, [id, name, price, currency, category]);
  return null;
}
