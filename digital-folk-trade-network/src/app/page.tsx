import { Card } from "@/components";

type Artisan = {
  name: string;
  craft: string;
  location: string;
  highlight: string;
};

type Product = {
  name: string;
  artisan: string;
  price: string;
  tag: string;
};

type Category = {
  title: string;
  detail: string;
};

const featuredArtisans: Artisan[] = [
  {
    name: "Aditi Singh",
    craft: "Handloom Weaving",
    location: "Odisha",
    highlight: "Natural indigo dyes and ikat patterns",
  },
  {
    name: "Meera Pillai",
    craft: "Terracotta",
    location: "Kerala",
    highlight: "Earth-fired tea sets and ritual vessels",
  },
  {
    name: "Rohan Das",
    craft: "Brass Work",
    location: "Karnataka",
    highlight: "Temple-inspired lamp engravings",
  },
];

const featuredProducts: Product[] = [
  {
    name: "Handwoven Indigo Shawl",
    artisan: "Aditi Singh",
    price: "₹4,800",
    tag: "Textiles",
  },
  {
    name: "Glazed Terracotta Tea Set",
    artisan: "Meera Pillai",
    price: "₹3,200",
    tag: "Ceramics",
  },
  {
    name: "Brass Oil Lamp",
    artisan: "Rohan Das",
    price: "₹2,400",
    tag: "Metalwork",
  },
  {
    name: "Warli Painted Tray",
    artisan: "Saira Khan",
    price: "₹1,900",
    tag: "Painting",
  },
  {
    name: "Bamboo Storage Basket",
    artisan: "Gopal Bora",
    price: "₹1,250",
    tag: "Bamboo",
  },
  {
    name: "Block Print Cushion",
    artisan: "Nisha Rani",
    price: "₹1,600",
    tag: "Prints",
  },
];

const craftCategories: Category[] = [
  { title: "Kutch & Gujarat", detail: "Mirror work, bandhani, ajrakh prints" },
  { title: "North East", detail: "Bamboo craft, handwoven stoles" },
  { title: "South India", detail: "Bronze work, temple textiles" },
  { title: "Central India", detail: "Gond & tribal paintings" },
  { title: "Himalayan", detail: "Wool weaving, metal jewelry" },
  { title: "Coastal", detail: "Shell craft, terracotta pottery" },
];

export default function Home() {
  return (
    <main className="space-y-12 px-4 py-8 sm:px-6 lg:px-10">
      <section className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-brand/15 via-white/5 to-purple-500/10 p-6 shadow-glow sm:p-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
            Digital Folk Trade Network
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-text-onDark sm:text-4xl">
            Discover, Connect, and Buy Authentic Folk Crafts
          </h1>
          <p className="max-w-2xl text-sm text-text-onDark/80 sm:text-base">
            Explore handpicked artisans, collect heirloom-worthy pieces, and follow the stories
            behind every craft.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Artisans", value: "2.4k" },
            { label: "Craft Regions", value: "28" },
            { label: "Curated Pieces", value: "1.1k" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-onDark shadow-elevated transition hover:-translate-y-1 hover:shadow-glow"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-text-onDark/60">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-text-onDark">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-artisans" className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 id="featured-artisans" className="text-xl font-semibold text-text-onDark">
              Featured Artisans
            </h2>
            <p className="text-sm text-text-onDark/70">
              Makers preserving regional techniques and stories.
            </p>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredArtisans.map((artisan) => (
            <Card key={artisan.name} tone="default">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-text-onDark">{artisan.name}</p>
                  <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand-light">
                    {artisan.location}
                  </span>
                </div>
                <p className="text-sm text-text-onDark/70">{artisan.craft}</p>
                <p className="text-sm text-text-onDark/80">{artisan.highlight}</p>
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-text-onDark transition hover:border-brand/70 hover:text-brand-light"
                >
                  View Profile
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-products" className="space-y-4">
        <header>
          <h2 id="featured-products" className="text-xl font-semibold text-text-onDark">
            Featured Products
          </h2>
          <p className="text-sm text-text-onDark/70">
            Ready-to-ship pieces chosen by our curators.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <Card key={product.name} tone="muted" className="group transition hover:-translate-y-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-text-onDark/70">
                    {product.tag}
                  </span>
                  <span className="text-sm font-semibold text-brand-light">{product.price}</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-text-onDark group-hover:text-brand-light">
                    {product.name}
                  </p>
                  <p className="text-sm text-text-onDark/70">by {product.artisan}</p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-brand/90 px-4 py-2 text-sm font-semibold text-surface-dark transition hover:bg-brand"
                >
                  Add to Cart
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="craft-categories" className="space-y-4">
        <header>
          <h2 id="craft-categories" className="text-xl font-semibold text-text-onDark">
            Craft Categories
          </h2>
          <p className="text-sm text-text-onDark/70">
            Browse by region or craft tradition.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {craftCategories.map((category) => (
            <Card key={category.title} tone="highlight">
              <div className="space-y-2">
                <p className="text-base font-semibold text-text-onDark">{category.title}</p>
                <p className="text-sm text-text-onDark/80">{category.detail}</p>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand-light transition hover:text-brand"
                >
                  Explore crafts
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-brand/20 via-white/5 to-purple-500/15 p-6 text-text-onDark sm:p-10">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Are you an artisan?</h2>
            <p className="text-sm text-text-onDark/80">
              Join the network to showcase your craft, tell your story, and reach mindful buyers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-surface-dark shadow-glow transition hover:-translate-y-[1px]"
            >
              Become a Seller
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-text-onDark transition hover:border-brand/80"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}