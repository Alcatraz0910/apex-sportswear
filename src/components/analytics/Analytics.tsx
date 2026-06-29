// src/components/analytics/Analytics.tsx
// Drop this once near the end of <body> in app/layout.tsx. It:
//   - shows the consent banner while choice is "unset"
//   - mounts the pixel snippets only after consent is "granted"
//   - fires a page_view on every App Router navigation (incl. first view)
"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getConsent, onConsentChange, type ConsentValue } from "@/lib/analytics/consent";
import { anyPixelConfigured, trackPageView } from "@/lib/analytics/track";
import PixelScripts from "./PixelScripts";
import ConsentBanner from "./ConsentBanner";

function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams(); // requires the Suspense boundary below
  useEffect(() => {
    trackPageView();
  }, [pathname, search]);
  return null;
}

// Subscribe to the consent store the React-blessed way: the server snapshot is
// always "unset" (matches SSR markup -> no hydration mismatch), then the client
// re-reads the persisted choice after hydration.
function useConsent(): ConsentValue {
  return useSyncExternalStore(onConsentChange, getConsent, (): ConsentValue => "unset");
}

export default function Analytics() {
  const consent = useConsent();

  // No pixel ids configured in Vercel yet -> nothing to consent to, render nothing.
  if (!anyPixelConfigured) return null;

  return (
    <>
      {consent === "granted" && (
        <>
          <PixelScripts />
          <Suspense fallback={null}>
            <PageViews />
          </Suspense>
        </>
      )}
      {consent === "unset" && <ConsentBanner />}
    </>
  );
}
