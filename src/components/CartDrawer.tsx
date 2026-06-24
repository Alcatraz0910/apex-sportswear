"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

function formatMoney(amount: string, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    Number.parseFloat(amount),
  );
}

export function CartDrawer() {
  const { cart, isOpen, closeCart, removeFromCart } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeCart]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const lines = cart?.lines.nodes ?? [];
  const total = cart?.cost.totalAmount;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping bag"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">
            Your Bag
            {cart && cart.totalQuantity > 0 && (
              <span className="ml-2 text-accent">({cart.totalQuantity})</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="rounded p-1 text-muted transition-colors hover:text-foreground"
            aria-label="Close bag"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted">
              Your bag is empty.
            </p>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => {
                const img = line.merchandise.product.featuredImage;
                const size = line.merchandise.selectedOptions.find(
                  (o) => o.name === "Size",
                )?.value;
                return (
                  <li key={line.id} className="flex gap-4">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText || line.merchandise.product.title}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-muted/20" />
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium leading-snug">
                          {line.merchandise.product.title}
                        </p>
                        {size && (
                          <p className="mt-0.5 text-xs text-muted">
                            Size: {size}
                          </p>
                        )}
                        {line.attributes
                          ?.filter((a) => a.value && a.value !== "—")
                          .map((a) => (
                            <p key={a.key} className="mt-0.5 text-xs text-accent">
                              {a.key}: {a.value}
                            </p>
                          ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {formatMoney(
                            line.cost.totalAmount.amount,
                            line.cost.totalAmount.currencyCode,
                          )}
                        </p>
                        <button
                          onClick={() => removeFromCart(line.id)}
                          className="text-xs text-muted underline underline-offset-2 hover:text-foreground"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && total && cart && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">
                {formatMoney(total.amount, total.currencyCode)}
              </span>
            </div>
            <p className="mb-4 text-center text-xs text-muted">
              Shipping calculated at checkout · Secure payment
            </p>
            <a
              href={cart.checkoutUrl}
              className="block w-full rounded-full bg-accent px-6 py-4 text-center text-base font-semibold text-black transition-transform hover:scale-[1.01]"
            >
              Checkout
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
