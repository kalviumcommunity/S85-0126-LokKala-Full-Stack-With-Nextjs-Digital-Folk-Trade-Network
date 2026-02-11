import { Card } from "@/components";

type ArtisanProfile = {
  name: string;
  location: string;
  craft: string;
  experience: string;
  story: string;
  signature: string;
  followers: string;
  rating: number;
  reviewCount: number;
};

type Product = {
  name: string;
  price: string;
  material: string;
};

type Review = {
  name: string;
  rating: number;
  note: string;
};

const artisan: ArtisanProfile = {
  name: "Aditi Singh",
  location: "Sambalpur, Odisha",
  craft: "Handloom Weaving",
  experience: "18 years of weaving ikat textiles",
  story:
    "I learnt the loom from my mother and grandmother. Every shawl carries the rhythm of our village, dyed with plants we gather after the monsoon. I work with a women-led collective that keeps the Sambalpuri patterns alive.",
  signature: "Signature: Double ikat, natural indigo, soft cotton",
  followers: "5.2k",
  rating: 4.8,
  reviewCount: 142,
};

const products: Product[] = [
  { name: "Handwoven Indigo Shawl", price: "₹4,800", material: "Cotton + indigo" },
  { name: "Sambalpuri Saree", price: "₹7,200", material: "Silk blend" },
  { name: "Ikat Table Runner", price: "₹2,250", material: "Handspun cotton" },
  { name: "Festival Dupatta", price: "₹3,100", material: "Organic cotton" },
  { name: "Heritage Cushion Set", price: "₹1,950", material: "Cotton + tassels" },
  { name: "Woven Stole", price: "₹2,800", material: "Soft cotton" },
];

const reviews: Review[] = [
  {
    name: "Meera Pillai",
    rating: 5,
    note: "The colors are even more beautiful in person. The story card was a lovely touch.",
  },
  {
    name: "Rohan Das",
    rating: 4.7,
    note: "Fast delivery and authentic weave. I can see the care in every thread.",
  },
  {
    name: "Saira Khan",
    rating: 4.8,
    note: "The shawl feels heirloom-worthy. Will be gifting another piece soon.",
  },
];

export default function ArtisanProfilePage() {
  return (
    <main className="space-y-10 px-4 py-8 sm:px-6 lg:px-10">
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-elevated sm:p-8 lg:grid-cols-[1.1fr_1.6fr]">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/20 text-3xl font-semibold text-brand-light">
            AS
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-text-onDark/60">
                Artisan profile
              </p>
              <h1 className="text-2xl font-semibold text-text-onDark sm:text-3xl">
                {artisan.name}
              </h1>
              <p className="text-sm text-text-onDark/70">
                {artisan.location} • {artisan.craft}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-text-onDark/80 sm:justify-start">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {artisan.experience}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {artisan.followers} followers
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand/20 via-white/5 to-purple-500/10 p-5 text-sm text-text-onDark/80">
            {artisan.story}
          </div>
          <p className="text-sm text-text-onDark/70">{artisan.signature}</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-surface-dark shadow-glow transition hover:-translate-y-[1px]"
            >
              Follow artisan
            </button>
            <div className="text-sm text-text-onDark/80">
              <span className="font-semibold text-brand-light">{artisan.rating}</span> rating ·
              <span className="ml-1">{artisan.reviewCount} reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="artisan-products" className="space-y-4">
        <header className="space-y-1">
          <h2 id="artisan-products" className="text-xl font-semibold text-text-onDark">
            Creations by {artisan.name}
          </h2>
          <p className="text-sm text-text-onDark/70">
            Handcrafted pieces inspired by community rituals and coastal dyeing traditions.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.name} tone="muted" className="group transition hover:-translate-y-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-text-onDark/70">
                    {product.material}
                  </span>
                  <span className="text-sm font-semibold text-brand-light">{product.price}</span>
                </div>
                <p className="text-base font-semibold text-text-onDark group-hover:text-brand-light">
                  {product.name}
                </p>
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-text-onDark transition hover:border-brand/70 hover:text-brand-light"
                >
                  View details
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="artisan-reviews" className="space-y-4">
        <header>
          <h2 id="artisan-reviews" className="text-xl font-semibold text-text-onDark">
            Reviews & ratings
          </h2>
          <p className="text-sm text-text-onDark/70">
            Feedback from collectors and community buyers.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.name} tone="default">
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
