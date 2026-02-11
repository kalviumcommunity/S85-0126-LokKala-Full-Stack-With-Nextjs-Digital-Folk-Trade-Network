"use client";

import { useState } from "react";
import { Card } from "@/components";

type CheckoutForm = {
  name: string;
  address: string;
};

export default function CheckoutPage() {
  const [form, setForm] = useState<CheckoutForm>({ name: "", address: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-onDark">Checkout</h1>
        <p className="text-sm text-text-onDark/70">
          Share your delivery details to place the order.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card tone="default">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-onDark" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-text-onDark"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-onDark" htmlFor="address">
                Delivery address
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={4}
                value={form.address}
                onChange={(event) => handleChange("address", event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-text-onDark"
                placeholder="House number, street, city, state"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-surface-dark shadow-glow transition hover:-translate-y-[1px]"
            >
              Place order
            </button>

            {submitted && (
              <p className="text-sm text-text-onDark/80">
                Order placed! You will receive a confirmation message shortly.
              </p>
            )}
          </form>
        </Card>

        <Card tone="muted">
          <div className="space-y-3 text-sm text-text-onDark/70">
            <h2 className="text-sm font-semibold text-text-onDark">What happens next?</h2>
            <ul className="space-y-2">
              <li>• We notify the artisan to prepare your craft.</li>
              <li>• You receive a delivery update within 24 hours.</li>
              <li>• No payment needed for this demo checkout.</li>
            </ul>
          </div>
        </Card>
      </section>
    </main>
  );
}
