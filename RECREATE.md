# Apex Sportswear — Recreate / Disaster-Recovery Runbook

How to stand the whole store back up elsewhere (new machine, new Shopify, new host) with
only stylistic changes. Keep a copy of this + the backup archive **off this machine**
(Google Drive / Dropbox / a second repo).

---

## 1. What the business is (stack)

- **Storefront:** Next.js 16 (App Router, TS) + Tailwind v4 + Framer Motion. Headless.
- **Commerce backend:** Shopify (products, cart, checkout, payments, orders, emails).
- **Hosting:** Vercel (auto-deploys on push to `main`).
- **Domain:** apexswear.co.uk (registrar: GoDaddy; DNS → Vercel).
- **Catalogue source:** Python scraper (`scraper/`) pulls suppliers, local LLM (LM Studio)
  cleans copy, pushes to Shopify. ~3,761 products (football clubs + national teams + NBA + F1).
- **Ops:** Notion workspace (orders/fulfilment/P&L/content) + `fulfil.py` + cron automations.

## 2. Where things live

| Thing | Location |
|---|---|
| Storefront code + catalogue bundle | GitHub: `github.com/Alcatraz0910/apex-sportswear` (PUBLIC) |
| Scraper / ops tooling (Python) | `scraper/` — **local only, in the backup archive** |
| Full catalogue data | `data/import-dryrun.json` (3,761 products) + `storefront/src/data/products.json` |
| Player lists / leagues | `storefront/src/data/players.json`, `scraper/team_leagues.json` |
| Notion DB ids | `scraper/notion_ids.json` |
| Secrets | `.env` files — **NOT in git, NOT in the archive** (see §6 to recreate) |

## 3. Restore the storefront

```bash
git clone https://github.com/Alcatraz0910/apex-sportswear.git
cd apex-sportswear && npm install
# add storefront/.env.local (see §6), then:
npm run build        # ~4,000 routes; reads Shopify live + bundle for images/attributes
```
Deploy: import the repo at **vercel.com → New Project** (auto-detects Next.js), add the
env vars from §6, Deploy.

## 4. Restore the catalogue into a fresh Shopify

If rebuilding Shopify from scratch (otherwise skip — products already live):
```bash
cd scraper
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # httpx, openai, bs4, lxml, python-dotenv
# fill scraper/.env (see §6), then re-create products from the saved catalogue:
.venv/bin/python pipeline.py --push --from-file ../data/import-dryrun.json   # productSet, +£5 markup, DRAFT
.venv/bin/python bulk_activate.py     # set all ACTIVE
.venv/bin/python push_images.py       # attach product images
.venv/bin/python create_addon.py      # the £4.99 personalisation add-on; put its variant id in env
```
`data/import-dryrun.json` is the full catalogue (titles, prices, variants, images, attributes) —
it IS the re-import source. No Shopify CSV export needed.

## 5. DNS (point a domain at Vercel)

In the registrar: root `A` → `76.76.21.21`; `www` `CNAME` → `cname.vercel-dns.com`.
Remove any old Shopify A-record / domain. Add the domain in Vercel → Settings → Domains.

## 6. Secrets / env vars (recreate — never stored in backup)

**`storefront/.env.local`** (also set these in Vercel):
| Var | What / where |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | `xxx.myshopify.com` |
| `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` | Shopify custom app → API credentials |
| `SHOPIFY_API_VERSION` | `2025-01` |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | same as store domain |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Shopify app → Storefront API access token (public) |
| `NEXT_PUBLIC_PERSONALISATION_VARIANT_ID` | variant id printed by `create_addon.py` |
| `RESEND_API_KEY` | resend.com (Apex Club emails) |
| `APEX_FROM_EMAIL` / `APEX_SITE_URL` | sender + site URL |

**`scraper/.env`:** `SHOPIFY_STORE`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`,
`SHOPIFY_API_VERSION`, `LLM_BASE_URL` (LM Studio, `http://localhost:1234/v1`), `LLM_MODEL`
(`qwen/qwen3-30b-a3b`), `NOTION_TOKEN`, `NOTION_PARENT_PAGE`. See `.env.example` files.

Shopify app scopes needed: read/write products, read/write orders,
`write_merchant_managed_fulfillment_orders`, read/write customers, Storefront API enabled.

## 7. Email

Shopify Settings → Notifications: sender `orders@<domain>` (authenticate with the DKIM
CNAMEs Shopify shows). Paste `shopify-templates/order-confirmation.liquid` into the Order
confirmation template. Domain mail = Zoho; keep DMARC + DKIM aligned.

## 8. Ops (optional)

- **Notion:** `python3 notion_setup.py` (creates the 4 DBs + Runbook), then `notion_sync.py push|pull`.
- **Automations:** `crontab` entries → `scraper/cron_football.sh` (daily), `scraper/cron_nba_f1.sh` (monthly).
- **Fulfilment:** `python3 fulfil.py list` / `ship`.

## 9. Where to make stylistic changes

- **Colours/brand:** accent `#00e676` — `storefront/src/app/globals.css` + per-league accents in
  `src/lib/leagues.ts`. Wordmark/slogan: `src/components/Header.tsx`, `Hero.tsx`, `Footer.tsx`.
- **Fonts:** `src/app/layout.tsx` (Bricolage Grotesque display font).
- **Cover/OG image:** regenerate via `storefront/scripts/make-cover.mjs`.
- **Homepage layout:** `src/app/page.tsx` + `src/components/*`.

The data layer (`src/lib/catalog.ts`) and Shopify integration stay the same — restyle the
components freely without touching commerce logic.
