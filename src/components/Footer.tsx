import Link from "next/link";
import { LEAGUES } from "@/lib/leagues";
import { NewsletterSignup } from "./NewsletterSignup";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="font-display text-2xl font-extrabold">
              APEX<span className="text-accent">.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-muted">
              Wear your allegiance. Premium football, NBA &amp; F1 kits — with
              Apex Club rewards on every order.
            </p>
            <div className="mt-6 max-w-sm">
              <NewsletterSignup />
            </div>
            <a
              href="https://www.tiktok.com/@apex.sportswear6"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-muted hover:text-accent"
            >
              Follow @apex.sportswear6 on TikTok ↗
            </a>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {LEAGUES.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/${l.slug}`}
                    className="text-muted hover:text-foreground"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Apex Club
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/apex-club"
                  className="text-muted hover:text-foreground"
                >
                  Rewards
                </Link>
              </li>
              <li>
                <Link
                  href="/apex-club"
                  className="text-muted hover:text-foreground"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Help
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Apex Sportswear. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
