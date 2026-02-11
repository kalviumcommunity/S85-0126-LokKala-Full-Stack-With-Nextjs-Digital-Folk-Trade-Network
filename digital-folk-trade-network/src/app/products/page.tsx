import Link from "next/link";
import { Card } from "@/components";

type Product = {
  id: string;
  name: string;
  price: string;
  artisan: string;
  tag: string;
};

const products: Product[] = [
  { id: "1", name: "Handwoven Indigo Shawl", price: "₹4,800", artisan: "Aditi Singh", tag: "Textiles" },
  { id: "2", name: "Glazed Terracotta Tea Set", price: "₹3,200", artisan: "Meera Pillai", tag: "Ceramics" },
  { id: "3", name: "Brass Oil Lamp", price: "₹2,400", artisan: "Rohan Das", tag: "Metalwork" },
  { id: "4", name: "Warli Painted Tray", price: "₹1,900", artisan: "Saira Khan", tag: "Painting" },
  { id: "5", name: "Bamboo Storage Basket", price: "₹1,250", artisan: "Gopal Bora", tag: "Bamboo" },
  { id: "6", name: "Block Print Cushion", price: "₹1,600", artisan: "Nisha Rani", tag: "Prints" },
];

const filters = [
  {
    title: "Craft type",
    options: ["Textiles", "Metalwork", "Ceramics", "Painting", "Bamboo"],
  },
  {
    title: "Region",
    options: ["Odisha", "Gujarat", "North East", "Kerala", "Himalayan"],
  },
  {
    title: "Price range",
    options: ["Under ₹1,500", "₹1,500 - ₹3,000", "₹3,000 - ₹6,000", "₹6,000+"] ,
  },
];

export default function ProductListingPage() {
  return (
    <main className="space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-text-onDark">Browse folk crafts</h1>
        <p className="text-sm text-text-onDark/70">
          Curated handmade pieces from verified artisan collectives.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card tone="muted">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text-onDark">Filters</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-light hover:text-brand"
                >
                  Clear all
                </button>
              </div>
              {filters.map((filter) => (
                <div key={filter.title} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-onDark/60">
                    {filter.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filter.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-text-onDark/70 transition hover:border-brand/60 hover:text-brand-light"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-onDark/70">Showing {products.length} pieces</p>
            <label className="flex items-center gap-2 text-sm text-text-onDark/70">
              Sort by
              <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-onDark">
                <option>Newest</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
                <option>Top rated</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} tone="default" className="group transition hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand-light">
                      {product.tag}
                    </span>
                    <span className="text-sm font-semibold text-text-onDark">{product.price}</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-onDark group-hover:text-brand-light">
                      {product.name}
                    </p>
                    <p className="text-sm text-text-onDark/70">by {product.artisan}</p>
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-text-onDark transition hover:border-brand/70 hover:text-brand-light"
                  >
                    View details
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
