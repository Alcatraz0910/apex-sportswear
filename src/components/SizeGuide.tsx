"use client";

import { useState } from "react";
import Image from "next/image";
import type { SizeChart } from "@/lib/types";

// Renders the size chart scraped from the supplier (table and/or image).
// Supplier origin (chart.source) is intentionally NOT shown to customers.
export function SizeGuide({
  chart,
  fitNote,
}: {
  chart: SizeChart;
  fitNote?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasContent = chart.table || chart.image;
  if (!hasContent) return null;

  return (
    <div className="mt-5 border-t border-border pt-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        aria-expanded={open}
      >
        {open ? "Hide size guide" : "📏 Size guide"}
      </button>

      {open && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          {chart.table && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  {chart.table.columns.map((c) => (
                    <th key={c} className="py-2 pr-4 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.table.rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 pr-4">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {chart.image && (
            <div className="relative mt-3 aspect-[3/2] w-full">
              <Image
                src={chart.image}
                alt="Size chart"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}

          {fitNote && (
            <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
              {fitNote}
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            Measurements are approximate. If you&apos;re between sizes, we
            recommend sizing up.
          </p>
        </div>
      )}
    </div>
  );
}
