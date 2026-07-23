import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ferrari from "@/assets/ferrari.jpg";
import mclaren from "@/assets/mclaren.jpg";
import porschee from "@/assets/porschee.jpg";
import heroCar from "@/assets/car-detail-2.jpg";
import { motion } from "framer-motion";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/dealers/")({
  head: () => ({
    meta: [
      { title: "Dealers - Marque" },
      {
        name: "description",
        content:
          "Verified boutique and specialist dealers across the Marque global network.",
      },
      { property: "og:title", content: "Dealers - Marque" },
      {
        property: "og:description",
        content:
          "Verified boutique and specialist dealers across the Marque global network.",
      },
    ],
  }),
  component: DealersPage,
});

const networkStats = [
  { value: "118", label: "verified dealers" },
  { value: "42", label: "active markets" },
  { value: "1.2k", label: "listed vehicles" },
];

const dealerCards = [
  {
    name: "Rossi Motori",
    region: "Milan / Monaco",
    focus: "Ferrari, Lamborghini, concours-grade GT",
    status: "Prime partner",
    image: ferrari,
  },
  {
    name: "Northline Performance",
    region: "Los Angeles / Scottsdale",
    focus: "Modern supercars, EV performance, private collections",
    status: "Verified",
    image: mclaren,
  },
  {
    name: "Heritage Works",
    region: "London / Zurich",
    focus: "Restomods, air-cooled Porsche, collector provenance",
    status: "Editorial source",
    image: porschee,
  },
];

const standards = [
  "Business identity and ownership review",
  "Inventory provenance and title hygiene",
  "Photography, inspection, and listing quality",
  "Response standards for qualified buyer handoff",
];

function DealersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        <section className="relative isolate overflow-hidden border-b border-border px-6 pb-14 pt-12 md:px-12 md:pb-16 md:pt-16">
          <div className="absolute inset-0 -z-10">
            <img
              src={heroCar}
              alt="Premium vehicle interior detail"
              width={1600}
              height={1000}
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
          </div>

          <div className="animate-reveal grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.78fr)] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <p className="eyebrow text-accent">Network</p>
                <span className="hidden h-px w-20 bg-border sm:block" />
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Curated dealer access
                </p>
              </div>
              <h1 className="font-display text-6xl italic uppercase leading-[0.86] tracking-normal md:text-8xl lg:text-[8.5rem]">
                Verified dealers.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                A controlled network for boutique, marque, and specialist
                dealers. The public directory is coming online with the backend
                build; verification and partner intake are already structured.
              </p>
            </div>

            <aside className="border border-white/10 bg-background/65 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Directory status
                </p>
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                  Build phase
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-px bg-border">
                {networkStats.map((stat) => (
                  <div key={stat.label} className="bg-background/90 p-4">
                    <p className="font-display text-3xl italic tracking-normal">
                      {stat.value}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase leading-4 tracking-[0.22em] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="grid border-b border-border md:grid-cols-[0.82fr_1.18fr]">
          <div className="border-b border-border p-6 md:border-b-0 md:border-r md:p-12">
            <p className="eyebrow text-accent">Verification layer</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl italic uppercase leading-none tracking-normal md:text-6xl">
              Trust before inventory.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              Every dealer profile is designed to answer the buyer's first
              question: who stands behind the car?
            </p>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2">
            {standards.map((standard, index) => (
              <article key={standard} className="bg-background p-6 md:p-8">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                    0{index + 1}
                  </span>
                  <ShieldCheck aria-hidden className="size-5 text-muted-foreground" />
                </div>
                <p className="max-w-sm text-sm leading-6 text-muted-foreground md:text-base">
                  {standard}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-border bg-[var(--color-surface)] px-6 py-20 md:px-12 md:py-24">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-accent">Regional partners</p>
              <h2 className="mt-4 font-display text-4xl italic uppercase leading-none tracking-normal md:text-6xl">
                Launch network.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Sample partner profiles preview the directory format while search,
              filtering, and dealer-managed inventory are being connected.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {dealerCards.map((dealer, i) => (
              <motion.article
                key={dealer.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: [0.19, 1, 0.22, 1],
                }}
                className="group border border-white/10 bg-background">
                <div className="relative aspect-[5/3] overflow-hidden bg-neutral-900">
                  <img
                    src={dealer.image}
                    alt={`${dealer.name} representative vehicle`}
                    width={760}
                    height={456}
                    className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] backdrop-blur">
                    <BadgeCheck aria-hidden className="size-3 text-accent" />
                    {dealer.status}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="font-display text-2xl italic uppercase tracking-normal">
                        {dealer.name}
                      </h3>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                        {dealer.region}
                      </p>
                    </div>
                    <ArrowUpRight aria-hidden className="mt-1 size-5 text-muted-foreground transition-colors group-hover:text-accent" />
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    {dealer.focus}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid border-b border-border md:grid-cols-3">
          <article className="border-b border-border p-6 md:border-b-0 md:border-r md:p-10">
            <Globe2 aria-hidden className="size-5 text-accent" />
            <h3 className="mt-8 font-display text-2xl italic uppercase tracking-normal">
              Global routing
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Match serious buyers to regional specialists and cross-border
              acquisition support.
            </p>
          </article>
          <article className="border-b border-border p-6 md:border-b-0 md:border-r md:p-10">
            <Building2 aria-hidden className="size-5 text-accent" />
            <h3 className="mt-8 font-display text-2xl italic uppercase tracking-normal">
              Dealer profiles
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Build trust with verified identity, inventory focus, service
              standards, and provenance habits.
            </p>
          </article>
          <article className="p-6 md:p-10">
            <Sparkles aria-hidden className="size-5 text-accent" />
            <h3 className="mt-8 font-display text-2xl italic uppercase tracking-normal">
              Editorial listings
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Give each dealer vehicle the same visual and documentation
              treatment as private consignment.
            </p>
          </article>
        </section>

        <section className="border-b border-border bg-background px-6 py-10 md:px-12 md:py-12">
          <div className="border border-border/60 bg-surface p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <p className="eyebrow text-accent">Dealer intake</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl italic uppercase leading-[0.95] tracking-tighter md:text-6xl">
                Join the network.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
                Verified dealer applications are open. Submit your business
                details and our team will respond within 3–5 days.
              </p>
              <Link
                to="/apply"
                className="mt-8 inline-flex h-14 items-center justify-center gap-3 bg-foreground px-10 font-mono text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
              >
                Apply as a dealer
                <ArrowUpRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
