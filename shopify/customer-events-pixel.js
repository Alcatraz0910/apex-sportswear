// ============================================================================
// Shopify > Settings > Customer events > Add custom pixel  ("Apex Marketing")
// Owns the events the headless storefront CANNOT see: InitiateCheckout + Purchase,
// because checkout runs on Shopify's hosted checkout, not apexswear.co.uk.
// Set the pixel Permission to require analytics + marketing consent, and enable
// Shopify's cookie banner (Settings > Customer privacy) so checkout-side consent
// is handled there. Replace the id below with your real TikTok pixel id.
// ============================================================================

const TIKTOK_PIXEL_ID = "D91CGQ3C77U7SVVMMPOG";

// --- load TikTok pixel inside the Customer Events sandbox -------------------
!(function (w, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = (w[t] = w[t] || []);
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  ttq.setAndDefer = function (a, b) { a[b] = function () { a.push([b].concat(Array.prototype.slice.call(arguments, 0))); }; };
  for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
  ttq.load = function (e) {
    var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r;
    var s = document.createElement("script"); s.async = true; s.src = r + "?sdkid=" + e + "&lib=ttq";
    document.head.appendChild(s);
  };
  ttq.load(TIKTOK_PIXEL_ID);
})(self, "ttq");

const ttq = self.ttq;

const contentsFrom = (checkout) =>
  (checkout?.lineItems || []).map((li) => ({
    content_id: li.variant?.id || li.variant?.product?.id,
    content_name: li.title,
    content_type: "product",
    quantity: li.quantity,
    price: li.variant?.price?.amount,
  }));

// InitiateCheckout — fires when the customer reaches Shopify checkout
analytics.subscribe("checkout_started", (event) => {
  const c = event.data?.checkout;
  if (!c) return;
  ttq.track("InitiateCheckout", {
    value: c.totalPrice?.amount,
    currency: c.currencyCode,
    contents: contentsFrom(c),
  });
});

// Purchase — fires on the order-confirmation step
analytics.subscribe("checkout_completed", (event) => {
  const c = event.data?.checkout;
  if (!c) return;
  ttq.track("CompletePayment", {
    value: c.totalPrice?.amount,
    currency: c.currencyCode,
    contents: contentsFrom(c),
    // order id available as c.order?.id — pass as event_id when you add server-side CAPI dedup
  });
});

// --- Meta + GA4: add later, same pattern -----------------------------------
// Meta:  load fbevents.js, then fbq('track','InitiateCheckout',{...}) / 'Purchase'
// GA4:   load gtag.js, then gtag('event','begin_checkout'|'purchase',{ transaction_id:c.order?.id, value, currency, items })
