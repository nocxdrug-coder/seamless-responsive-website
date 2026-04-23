/**
 * Shared cart state backed by localStorage so it persists across page reloads
 * and is accessible from both the catalog (add) and the cart page (read/remove).
 */
import { useState, useCallback } from "react";
import type { VirtualCard } from "~/data/cards";

const CART_KEY = "cc_shop_cart";

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  country: string;
  countryFlag: string;
  type: string;
  price: number;
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(readCart);

  const addToCart = useCallback((card: VirtualCard) => {
    setCart((prev) => {
      // Prevent duplicate entries
      if (prev.some((item) => item.id === card.id)) return prev;
      const next: CartItem[] = [
        ...prev,
        {
          id: card.id,
          name: card.name,
          brand: card.provider,
          country: card.country,
          countryFlag: card.countryFlag,
          type: card.type,
          price: card.price,
        },
      ];
      writeCart(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
    setCart([]);
  }, []);

  return { cart, addToCart, removeFromCart, clearCart };
}
