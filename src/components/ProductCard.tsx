"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ApexProduct } from "@/lib/types";
import { formatPrice, sizedImg } from "@/lib/catalog";

export function ProductCard({ product }: { product: ApexProduct }) {
  const img = product.images[0];
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link
        href={`/product/${product.handle}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-black">
          <Image
            src={sizedImg(img.src, 600)}
            alt={img.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.edition && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-black">
              {product.edition}
            </span>
          )}
        </div>
        <div className="p-4">
          {product.team && (
            <p className="text-xs uppercase tracking-widest text-muted">
              {product.team}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-tight">
            {product.display_title}
          </h3>
          <p className="mt-2 font-mono text-sm text-accent">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
