// Client-side Shopify Storefront API — cart mutations.
// Token: NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN (public, safe to expose to browser).

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";
const API_VERSION = "2025-01";

export const storefrontConfigured = Boolean(DOMAIN && TOKEN);

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!storefrontConfigured) throw new Error("Storefront API not configured");
  const res = await fetch(
    `https://${DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!res.ok) throw new Error(`Storefront API ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors)
    throw new Error(`Storefront errors: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

export interface LineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
}

export interface CartLine {
  id: string;
  quantity: number;
  attributes: { key: string; value: string }[];
  merchandise: {
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    product: { title: string; featuredImage?: { url: string; altText: string } };
    selectedOptions: { name: string; value: string }[];
  };
  cost: { totalAmount: { amount: string; currencyCode: string } };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { nodes: CartLine[] };
  cost: { totalAmount: { amount: string; currencyCode: string } };
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id checkoutUrl totalQuantity
    lines(first: 100) {
      nodes {
        id quantity
        attributes { key value }
        merchandise {
          ... on ProductVariant {
            id title
            price { amount currencyCode }
            product { title featuredImage { url altText } }
            selectedOptions { name value }
          }
        }
        cost { totalAmount { amount currencyCode } }
      }
    }
    cost { totalAmount { amount currencyCode } }
  }
`;

type CartPayload<K extends string> = Record<
  K,
  { cart: Cart; userErrors: { field: string; message: string }[] }
>;

function unwrap<K extends string>(payload: CartPayload<K>, key: K): Cart {
  const p = payload[key];
  if (p.userErrors.length) throw new Error(p.userErrors[0].message);
  return p.cart;
}

export async function cartCreate(lines: LineInput[]): Promise<Cart> {
  const data = await storefrontFetch<CartPayload<"cartCreate">>(
    `${CART_FRAGMENT}
     mutation CartCreate($input: CartInput!) {
       cartCreate(input: $input) { cart { ...CartFields } userErrors { field message } }
     }`,
    { input: { lines } },
  );
  return unwrap(data, "cartCreate");
}

export async function cartLinesAdd(cartId: string, lines: LineInput[]): Promise<Cart> {
  const data = await storefrontFetch<CartPayload<"cartLinesAdd">>(
    `${CART_FRAGMENT}
     mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
       cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
     }`,
    { cartId, lines },
  );
  return unwrap(data, "cartLinesAdd");
}

export async function cartLinesRemove(
  cartId: string,
  lineId: string,
): Promise<Cart> {
  const data = await storefrontFetch<CartPayload<"cartLinesRemove">>(
    `${CART_FRAGMENT}
     mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
       cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } }
     }`,
    { cartId, lineIds: [lineId] },
  );
  return unwrap(data, "cartLinesRemove");
}
