# Marketing analytics (TikTok / Meta / GA4)

Env-driven, consent-gated pixel layer. Nothing fires until the visitor accepts the
cookie banner. Providers are inert until their `NEXT_PUBLIC_*` id is set, so this is
safe to merge before the ad accounts exist — TikTok is live first; Meta + GA4 light up
the moment you add their ids.

## Storefront env vars (Vercel → Project → Settings → Environment Variables)

```
NEXT_PUBLIC_TIKTOK_PIXEL_ID=D91CGQ3C77U7SVVMMPOG
NEXT_PUBLIC_META_PIXEL_ID=            # leave blank until you have a Meta pixel
NEXT_PUBLIC_GA4_MEASUREMENT_ID=       # leave blank until you have GA4 (G-XXXXXXX)
```

`NEXT_PUBLIC_*` values are inlined at build time → **redeploy after adding/changing them.**

## What fires where

| Event | Source |
|---|---|
| `page_view` | storefront — `components/analytics/Analytics.tsx` (every App Router navigation) |
| `view_content` | storefront — `ProductViewTracker` on the PDP |
| `add_to_cart` | storefront — `BuyBox` add-to-bag handler |
| `initiate_checkout`, `purchase` | Shopify Web Pixel — `shopify/customer-events-pixel.js` |

Checkout + purchase happen on Shopify's hosted checkout (not apexswear.co.uk), so they're
owned by a Shopify **custom pixel**, not this Next.js app. To install it:
Shopify admin → **Settings → Customer events → Add custom pixel** ("Apex Marketing"),
paste `shopify/customer-events-pixel.js`, set Permission to require analytics + marketing
consent, and enable Shopify's cookie banner (**Settings → Customer privacy**).

## Consent

`lib/analytics/consent.ts` is the single source of truth (default = **denied**). The choice
persists in `localStorage` + a 1st-party cookie. The storefront banner covers
apexswear.co.uk; Shopify's own banner covers the checkout domain — two domains, two surfaces.

## Later upgrade

Server-side TikTok Events API / Meta CAPI off the Shopify order webhook, deduped on the
`event_id` already emitted client-side.
