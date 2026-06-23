// Shopify Admin API client (server-side only).
//
// During the build/preview phase the catalog is DRAFT, and the Storefront API does
// not expose draft products — so the storefront reads the catalog via the Admin API
// using the 2026 client-credentials flow (same creds as the scraper). At go-live,
// when products are ACTIVE + published, this swaps to the Storefront API for the
// public read path + cart/checkout.
//
// Credentials come from server-only env (no NEXT_PUBLIC_ prefix) so they never reach
// the client bundle. See .env.local.example.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET ?? "";
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2025-01";

export const shopifyConfigured = Boolean(DOMAIN && CLIENT_ID && CLIENT_SECRET);

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    // Cacheable so routes using generateStaticParams can prerender at build
    // (a 'no-store' fetch would force dynamic rendering and error out).
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`Shopify token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 86_400) * 1000,
  };
  return cachedToken.token;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_RETRIES = 6;

export async function adminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  attempt = 0,
): Promise<T> {
  const token = await getAccessToken();
  // Shopify cost-throttling returns HTTP 200 with a THROTTLED error. During a
  // multi-worker `next build` the workers burst the GraphQL endpoint and get
  // throttled; retry with exponential backoff + jitter. A query comment makes the
  // retry's request body unique so Next's Data Cache doesn't replay the throttled
  // 200 response.
  const body = attempt > 0 ? `${query}\n# retry ${attempt}` : query;
  const res = await fetch(
    `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: body, variables }),
      next: { revalidate: 3600 },
    },
  );

  const backoff = () => sleep(700 * 2 ** attempt + Math.random() * 400);

  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      await backoff();
      return adminGraphQL(query, variables, attempt + 1);
    }
    throw new Error(`Shopify Admin API error: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    if (JSON.stringify(json.errors).includes("THROTTLED") && attempt < MAX_RETRIES) {
      await backoff();
      return adminGraphQL(query, variables, attempt + 1);
    }
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

// Mutations must NOT be cached (unlike the catalog reads), so this uses no-store.
// Retries on throttling. Use for customerCreate, metafieldsSet, discount creation, etc.
export async function adminMutate<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const token = await getAccessToken();
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(
      `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
      },
    );
    const retriable = res.status === 429 || res.status >= 500;
    if (!res.ok) {
      if (retriable && attempt < MAX_RETRIES) {
        await sleep(700 * 2 ** attempt + Math.random() * 400);
        continue;
      }
      throw new Error(`Shopify Admin API error: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as { data?: T; errors?: unknown };
    if (json.errors) {
      if (JSON.stringify(json.errors).includes("THROTTLED") && attempt < MAX_RETRIES) {
        await sleep(700 * 2 ** attempt + Math.random() * 400);
        continue;
      }
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
    }
    return json.data as T;
  }
}
