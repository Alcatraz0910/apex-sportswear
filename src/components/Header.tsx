"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LEAGUES } from "@/lib/leagues";
import { useCart } from "@/lib/cart";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? "border-border bg-background/80 backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight"
        >
          <svg width="24" height="21" viewBox="100 120 312 272" aria-hidden="true">
            <path
              d="M256 120 L412 392 L330 392 L256 256 L182 392 L100 392 Z"
              fill="#00e676"
            />
          </svg>
          <span>
            APEX<span className="text-accent">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LEAGUES.map((l) => (
            <Link
              key={l.slug}
              href={`/${l.slug}`}
              className="text-sm font-medium uppercase tracking-wide text-muted transition-colors hover:text-foreground"
            >
              {l.name}
            </Link>
          ))}
          <Link
            href="/search"
            className="text-sm font-medium uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            Search
          </Link>
          <Link
            href="/apex-club"
            className="text-sm font-medium uppercase tracking-wide text-accent"
          >
            Apex Club
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/apex-club"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black sm:inline-block"
          >
            Join &amp; Save
          </Link>
          <button
            onClick={openCart}
            className="relative p-1 text-foreground transition-colors hover:text-accent"
            aria-label={`Open bag${itemCount ? ` (${itemCount} items)` : ""}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-sm uppercase tracking-wide md:hidden"
            aria-label="Toggle menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {LEAGUES.map((l) => (
            <Link
              key={l.slug}
              href={`/${l.slug}`}
              onClick={() => setOpen(false)}
              className="py-2 text-sm uppercase tracking-wide"
            >
              {l.name}
            </Link>
          ))}
          <Link
            href="/apex-club"
            onClick={() => setOpen(false)}
            className="py-2 text-sm uppercase tracking-wide text-accent"
          >
            Apex Club
          </Link>
        </nav>
      )}
    </header>
  );
}
