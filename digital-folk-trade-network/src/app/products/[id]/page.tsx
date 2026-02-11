import Link from "next/link";
import { Card } from "@/components";

type ProductDetail = {
  id: string;
  name: string;
  price: string;
  artisan: string;
  artisanId: string;
  description: string;
  details: string[];
};

type Review = {
  name: string;
  rating: number;
  note: string;
};

const product: ProductDetail = {
  id: "1",
  name: "Handwoven Indigo Shawl",
  price: "₹4,800",
  artisan: "Aditi Singh",
  artisanId: "1",
  description:
    "A handwoven shawl dyed in natural indigo and finished with traditional Sambalpuri motifs. Each piece is loomed over five days and sun-cured for softness.",
  details: [
    "Material: 100% handspun cotton",
    "Technique: Double ikat",
    "Care: Dry clean or cold hand wash",
    "Origin: Sambalpur, Odisha",
  ],
};

const reviews: Review[] = [
  {
    name: "Meera Pillai",
    rating: 5,
    note: "The texture is luxurious and the dye is so rich. Feels like an heirloom.",
  },
  {
    name: "Rohan Das",
    rating: 4.9,
    note: "Beautiful packaging and a lovely story card. Worth the price.",
  },
  {
    name: "Saira Khan",
    rating: 4.7,
    note: "Perfect gift for my mother. She loves the craftsmanship.",
  },
];

const gallery = ["Indigo weave", "Detail shot", "Drape styling", "Care card"];

export default function ProductDetailPage() {
  return (
    <main className="space-y-10 px-4 py-8 sm:px-6 lg:px-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 via-white/5 to-purple-500/10 text-sm text-text-onDark/70">
              Featured image
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {gallery.map((item) => (
                <div
                  key={item}
                  className="flex h-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-text-onDark/60"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-onDark/60">
              Folk textile
            </p>
            <h1 className="text-3xl font-semibold text-text-onDark">{product.name}</h1>
            <p className="text-lg font-semibold text-brand-light">{product.price}</p>
            <Link
              href={`/artisans/${product.artisanId}`}
              className="text-sm font-semibold text-text-onDark/70 hover:text-brand-light"
            >
              by {product.artisan}
            </Link>
          </div>

          <Card tone="default">
            <div className="space-y-3">
              <p className="text-sm text-text-onDark/80">{product.description}</p>
              <ul className="space-y-2 text-sm text-text-onDark/70">
                {product.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand/70" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-surface-dark shadow-glow transition hover:-translate-y-[1px]"
            >
              Add to cart
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold text-text-onDark transition hover:border-brand/70 hover:text-brand-light"
            >
              Save for later
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="product-reviews" className="space-y-4">
        <header>
          <h2 id="product-reviews" className="text-xl font-semibold text-text-onDark">
            Reviews
          </h2>
          <p className="text-sm text-text-onDark/70">
            Notes from collectors who purchased this craft.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.name} tone="muted">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-onDark">{review.name}</span>
                  <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand-light">
                    {review.rating}
                  </span>
                </div>
                <p className="text-sm text-text-onDark/80">{review.note}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
