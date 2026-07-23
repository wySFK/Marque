import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import heroCar from "@/assets/hero-car.jpg";
import car2 from "@/assets/car-2.jpg";
import car6 from "@/assets/car-6.jpg";
import attack from "@/assets/attack.mp4";
import supa from "@/assets/supa.mp4";
import { useState } from "react";
import { SideRail, MobileTopBar } from "@/components/site/SideRail";
import { Footer } from "@/components/site/Footer";
import { catalog, fmtPrice } from "@/data/cars";
import type { CarListing } from "@/data/cars";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const featured: CarListing[] = [
  catalog.find((c) => c.id === "ferrari-812-competizione")!,
  catalog.find((c) => c.id === "mclaren-p1-gtr")!,
  catalog.find((c) => c.id === "lamborghini-huracan-sto")!,
  catalog.find((c) => c.id === "mercedes-amg-gt-black-series")!,
  catalog.find((c) => c.id === "porsche-911-gt3-rs")!,
  catalog.find((c) => c.id === "koenigsegg-jesko-attack")!,
];

const showcase = [
  {
    src: attack,
    poster: car2,
    title: "Studio · Matte Black Hypercar",
    caption: "Cinematic orbit reveal — carbon fiber under rim light.",
  },
  {
    src: supa,
    poster: car6,
    title: "Warehouse · Burgundy Grand Tourer",
    caption: "Tracking shot along a hand-restored heritage GT.",
  },
];

const latestInventory: CarListing[] = [
  catalog.find((c) => c.id === "zephyr-v")!,
  catalog.find((c) => c.id === "bentley-ct-gt")!,
  catalog.find((c) => c.id === "alfa-romeo-4c")!,
  catalog.find((c) => c.id === "porsche-718-spyder")!,
  catalog.find((c) => c.id === "lotus-evija")!,
  catalog.find((c) => c.id === "ford-mustang-1967")!,
];

// ── Computed catalog stats ──
const catalogCount = catalog.length;
const availableCount = catalog.filter((c) => c.status === "AVAILABLE").length;
const dealerCount = new Set(catalog.map((c) => c.dealer)).size;
const avgHp = Math.round(
  catalog.reduce((s, c) => s + c.hp, 0) / catalog.length,
);

const brands = [
  "PORSCHE",
  "FERRARI",
  "MCLAREN",
  "ASTON MARTIN",
  "LAMBORGHINI",
  "RIVIAN",
  "LUCID",
  "BENTLEY",
];

const stats = [
  { label: "Inventory", value: String(catalogCount) },
  { label: "Available now", value: String(availableCount) },
  { label: "Verified dealers", value: String(dealerCount) },
  { label: "Avg. horsepower", value: String(avgHp) },
];

const testimonials = [
  {
    quote:
      "AutoVerse represents the clinical precision missing from the digital car buying experience. The acquisition of my V8 Heritage was handled with the gravity it deserved.",
    author: "Private Collector",
    role: "Monaco",
  },
  {
    quote:
      "For a dealership operating at the top of the market, the platform is finally taking listings seriously. Editorial, discreet, fast.",
    author: "Independent Dealer",
    role: "Southern California",
  },
];

function LandingPage() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [heroMaxPrice, setHeroMaxPrice] = useState("");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, string> = {};
    if (heroSearch.trim()) search.search = heroSearch.trim();
    if (heroMaxPrice.trim()) {
      const cleaned = heroMaxPrice.replace(/[$,]/g, "");
      if (cleaned) search.maxPrice = cleaned;
    }
    navigate({ to: "/cars", search });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MobileTopBar />
      <SideRail />

      <main className="md:pl-16">
        {/* HERO */}
        <section
          aria-label="Introduction"
          className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden p-6 pt-24 md:p-12 md:pt-24"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={heroCar}
              alt="Matte black hypercar in a dark studio"
              width={1920}
              height={1080}
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent via-background/50" />
          </div>

          <div className="animate-reveal relative z-10 max-w-4xl">
            <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.4em] text-accent">
              Marque · Curated Automotive
            </span>
            <h1 className="mb-6 font-display text-6xl italic uppercase leading-[0.85] tracking-tighter text-balance md:text-8xl lg:text-9xl">
              Precision.
              <br />
              <span className="text-muted-foreground/40">Curated.</span>
            </h1>
            <p className="mb-8 max-w-xl text-base text-muted-foreground md:text-lg">
              A verified marketplace for high-performance and collector automobiles.
              Editorial listings, transparent provenance, direct access to
              certified dealers.
            </p>

            <div className="mb-8 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                {catalogCount} listings
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                {dealerCount} verified dealers
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                {availableCount} available
              </span>
            </div>

            <form
              onSubmit={handleHeroSubmit}
              className="group flex flex-wrap items-stretch border-2 border-white/[0.08] bg-background/30 backdrop-blur-xl transition-all duration-500 focus-within:border-accent/40 focus-within:bg-background/50 hover:border-white/[0.15]"
            >
              <div className="min-w-[170px] flex-1 px-5 py-4 transition-colors duration-300 hover:bg-white/[0.02]">
                <label
                  htmlFor="hero-search"
                  className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground group-focus-within:text-accent transition-colors"
                >
                  Configuration
                </label>
                <input
                  id="hero-search"
                  type="text"
                  placeholder="Make / Model"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent text-base font-medium outline-none placeholder:text-neutral-600"
                />
              </div>
              <div className="hidden w-px self-stretch bg-white/10 md:block" />
              <div className="min-w-[140px] flex-1 px-5 py-4 transition-colors duration-300 hover:bg-white/[0.02]">
                <label
                  htmlFor="hero-price"
                  className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground group-focus-within:text-accent transition-colors"
                >
                  Max price
                </label>
                <input
                  id="hero-price"
                  type="text"
                  placeholder="$250,000"
                  value={heroMaxPrice}
                  onChange={(e) => setHeroMaxPrice(e.target.value)}
                  className="w-full bg-transparent text-base font-medium outline-none placeholder:text-neutral-600"
                />
              </div>
              <button
                type="submit"
                className="flex h-14 items-center justify-center bg-foreground px-8 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-all duration-500 hover:bg-accent hover:text-accent-foreground md:h-auto md:px-9 cursor-pointer"
              >
                <span>Browse Inventory</span>
                <span className="ml-3 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </form>
          </div>
        </section>

        {/* BRAND STRIP */}
        <section
          aria-label="Represented brands"
          className="overflow-hidden border-y border-border py-10"
        >
          <div className="flex w-max animate-marquee items-center gap-16 whitespace-nowrap px-6 opacity-40 md:px-12">
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="font-display text-2xl font-bold tracking-tighter md:text-3xl"
              >
                {brand}
              </span>
            ))}
          </div>
        </section>

        {/* FEATURED — horizontal scroll */}
        <section aria-label="Featured acquisitions" className="py-20 md:py-28 md:pl-12">
          <header className="mb-12 flex flex-col gap-4 px-6 md:mb-14 md:flex-row md:items-end md:justify-between md:px-0 md:pr-12">
            <div>
              <p className="eyebrow mb-3">The selection</p>
              <h2 className="font-display text-4xl italic uppercase tracking-tighter md:text-5xl">
                Featured acquisitions
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Selected for provenance, engineering integrity, and condition.
              </p>
            </div>
            <Link
              to="/cars"
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent hover:text-foreground"
            >
              [ View all ]
            </Link>
          </header>

          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-8 md:gap-8 md:px-0 md:pr-12">
            {featured.map((car) => (
              <article
                key={car.id}
                className="group w-[80vw] min-w-[280px] shrink-0 snap-start cursor-pointer md:w-[420px] md:min-w-[420px]"
              >
                <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-neutral-900">
                  <img
                    src={car.image}
                    alt={car.name}
                    loading="lazy"
                    width={900}
                    height={1125}
                    className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-100"
                  />
                  <span className="absolute right-4 top-4 bg-background/80 px-3 py-1 font-mono text-[10px] tracking-widest backdrop-blur">
                    {car.status}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight md:text-xl">
                      {car.name}
                    </h3>
                    <div className="mt-2 flex gap-4 font-mono text-[10px] uppercase text-muted-foreground">
                      <span>{car.year}</span>
                      <span>{car.engine}</span>
                      <span>{car.hp} HP</span>
                    </div>
                  </div>
                  <div className="text-base font-bold md:text-lg">{fmtPrice(car.price)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SHOWCASE — video reels */}
        <section
          aria-label="In motion"
          className="border-t border-border bg-black py-20 md:py-28"
        >
          <header className="mb-12 flex flex-col gap-4 px-6 md:mb-14 md:flex-row md:items-end md:justify-between md:px-12">
            <div>
              <p className="eyebrow mb-3 text-accent">In motion</p>
              <h2 className="font-display text-4xl italic uppercase tracking-tighter md:text-5xl">
                The showcase
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Every listing is captured in studio and in motion. A closer look
                at engineering, materials, and stance.
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              [ Reel 01 — 02 ]
            </span>
          </header>

          <div className="grid gap-6 px-6 md:grid-cols-2 md:gap-8 md:px-12">
            {showcase.map((v) => (
              <figure key={v.src} className="group relative overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-neutral-900">
                  <video
                    src={v.src}
                    poster={v.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 flex items-center gap-2 bg-background/70 px-3 py-1 font-mono text-[10px] tracking-widest backdrop-blur">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                    LIVE REEL
                  </span>
                </div>
                <figcaption className="mt-4 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-bold tracking-tight md:text-base">
                      {v.title}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {v.caption}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

        </section>

        {/* LATEST INVENTORY */}
        <section
          aria-label="Latest inventory"
          className="border-t border-border bg-[var(--color-surface)] py-20 md:py-28"
        >
          <header className="mb-12 flex flex-col gap-4 px-6 md:mb-14 md:flex-row md:items-end md:justify-between md:px-12">
            <div>
              <p className="eyebrow mb-3">Latest inventory</p>
              <h2 className="font-display text-4xl italic uppercase tracking-tighter md:text-5xl">
                Newly listed
              </h2>
            </div>
            <Link
              to="/cars"
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
            >
              Browse full inventory →
            </Link>
          </header>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-6 md:grid-cols-3 md:px-12 lg:grid-cols-6">
            {latestInventory.map((car) => (
              <article key={car.name} className="group cursor-pointer">
                <div className="mb-3 aspect-square overflow-hidden bg-background">
                  <img
                    src={car.image}
                    alt={car.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="h-full w-full scale-105 object-cover transition-transform duration-500 group-hover:scale-100"
                  />
                </div>
                <p className="text-xs font-semibold tracking-tight md:text-sm">
                  {car.name}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
                  {car.engine} · {car.hp} HP
                </p>
                <p className="mt-1 text-xs md:text-sm">{fmtPrice(car.price)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section
          aria-label="AutoVerse by the numbers"
          className="grid grid-cols-2 border-t border-border md:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-8 md:p-12 ${
                i < stats.length - 1 ? "md:border-r md:border-border" : ""
              } ${i % 2 === 0 ? "border-r border-border md:border-r" : ""} ${
                i < 2 ? "border-b border-border md:border-b-0" : ""
              }`}
            >
              <div className="eyebrow mb-4">{stat.label}</div>
              <div className="font-display text-4xl italic tracking-tighter md:text-5xl">
                {stat.value}
              </div>
            </div>
          ))}
        </section>

        {/* TESTIMONIALS */}
        <section
          aria-label="Client voices"
          className="border-y border-border bg-[var(--color-surface)] px-6 py-24 md:px-12 md:py-32"
        >
          <p className="eyebrow mb-10 text-accent">Provenance matters</p>
          <div className="grid gap-16 md:grid-cols-2">
            {testimonials.map((t) => (
              <blockquote key={t.author} className="max-w-xl">
                <p className="font-display text-2xl italic leading-tight text-pretty md:text-3xl">
                  “{t.quote}”
                </p>
                <footer className="mt-10 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-neutral-800" />
                  <div>
                    <p className="font-bold">{t.author}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 py-32 text-center md:py-48">
          <h2 className="mb-10 font-display text-6xl italic uppercase leading-none tracking-tighter md:text-8xl lg:text-[12rem]">
            List yours.
          </h2>
          <p className="mx-auto mb-12 max-w-xl font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:text-xs">
            Join the most prestigious digital automotive network in the world.
          </p>
          <Link
            to="/sell"
            className="inline-flex h-16 items-center justify-center border border-white/20 px-12 font-mono text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground md:px-16"
          >
            Start consignment
          </Link>
        </section>

        <Footer />
      </main>
    </div>
  );
}
