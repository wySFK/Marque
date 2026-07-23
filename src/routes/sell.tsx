import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import carDetail1 from "@/assets/car-detail-1.jpg";
import carDetail2 from "@/assets/car-detail-2.jpg";
import car5 from "@/assets/car-5.jpg";
import heroCar from "@/assets/hero-car.jpg";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Consignment - Marque" },
      {
        name: "description",
        content:
          "List your vehicle with Marque. Private consignment, editorial listings, verified buyers.",
      },
      { property: "og:title", content: "Consignment - Marque" },
      {
        property: "og:description",
        content:
          "List your vehicle with Marque. Private consignment, editorial listings, verified buyers.",
      },
    ],
  }),
  component: SellPage,
});

const processSteps = [
  {
    label: "01",
    title: "Private valuation",
    body: "We review condition, options, mileage, provenance, market demand, and your ideal timeline before suggesting a launch range.",
    icon: ClipboardCheck,
  },
  {
    label: "02",
    title: "Editorial build",
    body: "A specialist listing is prepared with studio grade imagery, mechanical notes, ownership history, and buyer-ready documentation.",
    icon: Camera,
  },
  {
    label: "03",
    title: "Verified demand",
    body: "Qualified buyers and dealer partners are surfaced first, keeping conversations focused and protecting your time.",
    icon: ShieldCheck,
  },
];

const highlights = [
  { value: "3.8%", label: "target commission" },
  { value: "72h", label: "valuation window" },
  { value: "118", label: "verified dealers" },
];

const sellingPoints = [
  "Private seller and dealer intake",
  "Market-positioned listing copy",
  "Photography direction and media review",
  "Buyer qualification before handoff",
];

const listingDossier = [
  { label: "Market scan", value: "Comps / demand / price band" },
  { label: "Media brief", value: "Angles / details / condition proof" },
  { label: "Buyer packet", value: "Records / handoff / next steps" },
];

const documents = [
  { title: "Ownership", detail: "Title, registration, lien status", icon: FileText },
  { title: "Condition", detail: "Service records, tire age, paint notes", icon: Gauge },
  { title: "Story", detail: "Options, modifications, provenance", icon: MessageCircle },
];

function SellPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        <section className="relative isolate overflow-hidden border-b border-border px-6 pb-10 pt-8 md:px-12 md:pb-12 md:pt-8">
          <div className="absolute inset-0 -z-10">
            <img
              src={heroCar}
              alt="Black performance car in a low-lit studio"
              width={1920}
              height={1080}
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          </div>

          <div className="grid gap-8 lg:min-h-[560px] lg:grid-cols-[minmax(0,0.96fr)_minmax(440px,0.82fr)] lg:items-start xl:min-h-[600px]">
            <div className="animate-reveal max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <p className="eyebrow text-accent">Consignment</p>
                <span className="hidden h-px w-20 bg-border sm:block" />
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Private intake / verified buyers
                </p>
              </div>
              <h1 className="mt-8 max-w-[12ch] font-display text-6xl italic uppercase leading-[0.82] tracking-normal md:mt-10 md:text-8xl lg:text-[8.5rem] xl:text-[10rem]">
                List yours.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Private valuation. Verified buyers. No public listing until you're ready.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:consignment@marque.example?subject=Marque%20consignment%20request"
                  className="inline-flex h-14 items-center justify-center gap-3 bg-foreground px-7 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Email acquisitions
                  <ArrowUpRight aria-hidden className="size-4" />
                </a>
                <Link
                  to="/cars"
                  className="inline-flex h-14 items-center justify-center gap-3 border border-white/15 px-7 font-mono text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  View market
                  <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </div>
            </div>

            <aside className="grid gap-3" aria-label="Consignment snapshot">
              <div className="border border-white/10 bg-background/65 p-4 backdrop-blur-md md:p-5">
                <div className="flex items-center justify-between gap-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    Intake status
                  </p>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                    Open
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-px bg-border">
                  {highlights.map((item) => (
                    <div key={item.label} className="bg-background/90 p-3 md:p-4">
                      <p className="font-display text-2xl italic tracking-normal md:text-3xl">
                        {item.value}
                      </p>
                      <p className="mt-2 font-mono text-[9px] uppercase leading-4 tracking-[0.22em] text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[0.9fr_1fr] gap-3">
                <div className="relative min-h-52 overflow-hidden bg-neutral-900 md:min-h-80 lg:min-h-[360px]">
                  <img
                    src={carDetail1}
                    alt="Close detail of a collector vehicle wheel"
                    width={640}
                    height={820}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.25em] text-foreground">
                    Detail study
                  </p>
                </div>
                <div className="relative min-h-52 overflow-hidden bg-neutral-900 md:min-h-80 lg:min-h-[360px]">
                  <img
                    src={carDetail2}
                    alt="Interior detail of a premium vehicle"
                    width={640}
                    height={820}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <p className="absolute bottom-4 left-4 font-mono text-[9px] uppercase tracking-[0.25em] text-foreground">
                    Provenance file
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid border-b border-border md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-border p-6 md:border-b-0 md:border-r md:p-12">
            <p className="eyebrow text-accent">How it works</p>
            <h2 className="mt-4 max-w-lg font-display text-4xl italic uppercase leading-none tracking-normal md:text-6xl">
              A sharper route to the right buyer.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              No mass listings, no algorithms. Every submission is reviewed and guided by hand, from intake to launch.
            </p>
          </div>

          <div className="divide-y divide-border">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article key={step.label} className="group grid gap-6 p-6 md:grid-cols-[88px_1fr] md:p-10">
                  <div className="flex items-center gap-4 md:block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                      {step.label}
                    </span>
                    <div className="mt-0 flex size-10 items-center justify-center border border-white/15 text-muted-foreground transition-colors group-hover:border-accent group-hover:text-accent md:mt-6">
                      <Icon aria-hidden className="size-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl italic uppercase tracking-normal">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                      {step.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid border-b border-border bg-[var(--color-surface)] md:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden md:min-h-[620px]">
            <img
              src={car5}
              alt="Luxury grand tourer photographed in profile"
              width={1200}
              height={1400}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-6 md:bottom-10 md:left-10 md:right-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">
                Studio-ready listing
              </p>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                04 / M
              </span>
            </div>
          </div>

          <div className="p-6 md:p-12">
            <div>
              <p className="eyebrow text-accent">What we prepare</p>
              <h2 className="mt-4 max-w-xl font-display text-4xl italic uppercase leading-none tracking-normal md:text-6xl">
                Built around proof, not noise.
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                Before a listing goes live, we shape the sale around evidence:
                price context, media priorities, ownership records, and the
                questions a serious buyer will ask first.
              </p>
            </div>

            <div className="mt-10 border-y border-border py-6">
              <div className="mb-5 flex items-center justify-between gap-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Listing dossier
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                  Prepared pre-launch
                </span>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {listingDossier.map((item) => (
                  <div key={item.label} className="bg-[var(--color-surface)] p-4">
                    <p className="font-display text-xl italic uppercase tracking-normal">
                      {item.label}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase leading-5 tracking-[0.2em] text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {sellingPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 border border-white/10 bg-background/45 p-4">
                    <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                    <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-px bg-border md:grid-cols-3">
                {documents.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article key={item.title} className="bg-background p-5">
                      <Icon aria-hidden className="size-5 text-accent" />
                      <h3 className="mt-5 font-display text-xl italic uppercase tracking-normal">
                        {item.title}
                      </h3>
                      <p className="mt-2 font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-muted-foreground">
                        {item.detail}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28">
          <div className="flex flex-col items-center gap-10 border-y border-border py-12 text-center">
            <div className="max-w-3xl">
              <p className="eyebrow text-accent">Start privately</p>
              <h2 className="mt-4 font-display text-5xl italic uppercase leading-none tracking-tight md:text-7xl">
                Send the car. We will shape the listing.
              </h2>
              <p className="mt-6 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                Share the model, mileage, location, ownership status, and a few
                images. The team can respond with valuation guidance while the
                full upload portal is being completed.
              </p>
            </div>
            <a
              href="mailto:consignment@marque.example?subject=Marque%20consignment%20request"
              className="inline-flex h-16 items-center justify-center gap-3 border border-white/20 px-10 font-mono text-[12px] uppercase tracking-[0.28em] transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground md:px-14"
            >
              Request review
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
