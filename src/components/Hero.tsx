"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LEAGUES } from "@/lib/leagues";
import { accentVar } from "@/lib/style";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="accent-glow pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-accent"
        >
          Football · NBA · F1
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl"
        >
          Wear your
          <br />
          <span className="text-accent">allegiance</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-md text-lg text-muted"
        >
          Premium kits from the clubs, teams and grids you live for. Join the
          Apex Club for early access and members-only offers.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          {LEAGUES.map((l) => (
            <Link
              key={l.slug}
              href={`/${l.slug}`}
              style={accentVar(l.accent)}
              className="rounded-full border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-black"
            >
              Shop {l.name}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
