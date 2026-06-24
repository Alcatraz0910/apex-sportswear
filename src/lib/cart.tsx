"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  cartCreate,
  cartLinesAdd,
  cartLinesRemove,
  getCart,
  type Cart,
  type LineInput,
} from "./storefront";

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (lines: LineInput[]) => Promise<void>;
  removeFromCart: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cart: null,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: async () => {},
  removeFromCart: async () => {},
});

export type { LineInput };

const STORAGE_KEY = "apex-cart-id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    setCartId(stored);
    // Load the existing cart's CONTENTS (not just its id) so opening the bag shows
    // current items immediately — without this, the bag looks empty until you add.
    getCart(stored)
      .then((c) => {
        if (c && c.id) setCart(c);
        else {
          localStorage.removeItem(STORAGE_KEY); // expired/completed cart — reset
          setCartId(null);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (cartId) localStorage.setItem(STORAGE_KEY, cartId);
  }, [cartId]);

  const addToCart = useCallback(
    async (lines: LineInput[]) => {
      try {
        const updated = cartId
          ? await cartLinesAdd(cartId, lines)
          : await cartCreate(lines);
        if (!cartId) setCartId(updated.id);
        setCart(updated);
        setIsOpen(true);
      } catch (err) {
        console.error("[cart] addToCart failed:", err);
      }
    },
    [cartId],
  );

  const removeFromCart = useCallback(
    async (lineId: string) => {
      if (!cartId) return;
      try {
        setCart(await cartLinesRemove(cartId, lineId));
      } catch (err) {
        console.error("[cart] removeFromCart failed:", err);
      }
    },
    [cartId],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
