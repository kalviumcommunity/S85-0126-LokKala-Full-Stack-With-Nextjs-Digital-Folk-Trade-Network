"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components";

type CartItem = {
  id: string;
  name: string;
  price: number;
  artisan: string;
  quantity: number;
};

const initialItems: CartItem[] = [
  { id: "1", name: "Handwoven Indigo Shawl", price: 4800, artisan: "Aditi Singh", quantity: 1 },
  { id: "2", name: "Glazed Terracotta Tea Set", price: 3200, artisan: "Meera Pillai", quantity: 2 },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-onDark">Your cart</h1>
        <p className="text-sm text-text-onDark/70">
          Review your selected crafts before placing an order.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <Card tone="muted">
              <p className="text-sm text-text-onDark/80">Your cart is empty.</p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} tone="default">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-text-onDark">{item.name}</p>
                    <p className="text-sm text-text-onDark/70">by {item.artisan}</p>
                    <p className="mt-1 text-sm font-semibold text-brand-light">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm font-semibold text-text-onDark/80 hover:text-brand-light"
                        aria-label={`Decrease quantity for ${item.name}`}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        −
                      </button>
                      <span className="px-3 text-sm font-semibold text-text-onDark">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm font-semibold text-text-onDark/80 hover:text-brand-light"
                        aria-label={`Increase quantity for ${item.name}`}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-semibold text-text-onDark/70 hover:text-brand-light"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <aside className="space-y-4">
          <Card tone="muted">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-text-onDark">Order summary</h2>
              <div className="flex items-center justify-between text-sm text-text-onDark/70">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-text-onDark/70">
                <span>Shipping</span>
                <span>₹0</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-text-onDark">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-surface-dark shadow-glow transition hover:-translate-y-[1px]"
              >
                Proceed to checkout
              </Link>
            </div>
          </Card>

          <Card tone="default">
            <p className="text-sm text-text-onDark/70">
              Need help? Our artisan support team replies within 24 hours.
            </p>
          </Card>
        </aside>
      </section>
    </main>
  );
}
