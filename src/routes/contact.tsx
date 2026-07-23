import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Send, ChevronDown } from "lucide-react";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Marque" },
      {
        name: "description",
        content: "Get in touch with the Marque team. Inquiries, consignment requests, and general contact.",
      },
    ],
  }),
  component: ContactPage,
});

const countryCodes = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+39", label: "IT +39" },
  { code: "+49", label: "DE +49" },
  { code: "+46", label: "SE +46" },
  { code: "+31", label: "NL +31" },
  { code: "+33", label: "FR +33" },
  { code: "+41", label: "CH +41" },
  { code: "+971", label: "UAE +971" },
  { code: "+81", label: "JP +81" },
  { code: "+65", label: "SG +65" },
  { code: "+61", label: "AU +61" },
];

const bottomLinks = [
  { label: "Customer Support", description: "Get help with listings, account issues, or general questions about the platform." },
  { label: "Feedback & Suggestions", description: "Help us improve — share your experience, ideas, or feature requests." },
  { label: "Media Inquiries", description: "For press kits, partnership opportunities, and editorial requests, please contact us at press@marque.com" },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        {/* ── HERO HEADER ── */}
        <section className="relative border-b border-border px-6 pt-28 pb-16 md:px-12 md:pt-40 md:pb-20">
          <Link
            to="/"
            className="absolute left-6 top-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground md:left-12 md:top-12"
          >
            <ArrowLeft className="size-3" />
            Back
          </Link>
          <div className="animate-reveal">
            <p className="eyebrow mb-4 text-accent">Connect</p>
            <h1 className="font-display text-5xl italic uppercase leading-[0.9] tracking-tighter md:text-7xl">
              Get in touch.
            </h1>
            <p className="mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
              You can reach us anytime — we respond to every inquiry personally.
            </p>
          </div>
        </section>

        {/* ── TWO-COLUMN CONTENT ── */}
        <section className="grid border-b border-border md:grid-cols-[1fr_1.2fr]">
          {/* ── LEFT: Contact us ── */}
          <div className="border-b border-border p-6 md:border-b-0 md:border-r md:p-12 lg:p-16">
            <p className="eyebrow mb-8 text-accent">Contact us</p>

            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Email us, call, or complete the form to learn how Marque can solve your messaging problem.
            </p>

            {/* Email */}
            <div className="mt-8 space-y-6">
              <div className="group">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Email
                </p>
                <a
                  href="mailto:info@marque.io"
                  className="mt-1 inline-block text-sm font-medium transition-colors hover:text-accent md:text-base"
                >
                  info@marque.io
                </a>
              </div>

              {/* Phone */}
              <div className="group">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Phone
                </p>
                <p className="mt-1 text-sm font-medium md:text-base">
                  +1 (555) 000-0000
                </p>
              </div>

              {/* Customer Support link */}
              <div className="group">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Need help?
                </p>
                <a
                  href="mailto:support@marque.io"
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent underline underline-offset-4 transition-colors hover:text-foreground md:text-base"
                >
                  Customer support
                  <ArrowLeft className="size-3 -rotate-45" />
                </a>
              </div>
            </div>

            {/* Bottom links */}
            <div className="mt-12 border-t border-border pt-6">
              <div className="flex flex-col gap-6">
                {bottomLinks.map((link) => (
                  <div
                    key={link.label}
                    className="group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-1 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-accent" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground group-hover:text-accent transition-colors">
                        {link.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                      {link.description}
                    </p>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact form ── */}
          <div className="p-6 md:p-12 lg:p-16">
            <p className="eyebrow mb-8 text-accent">Send a message</p>
            <p className="mb-8 text-sm text-muted-foreground">
              You can reach us anytime
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* First name + Last name */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="group relative">
                  <label
                    htmlFor="firstName"
                    className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors group-focus-within:text-accent"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder=""
                    className="w-full border border-input bg-transparent px-4 py-3 font-mono text-sm outline-none transition-all duration-300 placeholder:text-neutral-700 focus:border-accent focus:bg-accent/[0.02] focus:shadow-[0_0_0_1px_oklch(0.58_0.22_27/0.15)]"
                  />
                </div>
                <div className="group relative">
                  <label
                    htmlFor="lastName"
                    className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors group-focus-within:text-accent"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder=""
                    className="w-full border border-input bg-transparent px-4 py-3 font-mono text-sm outline-none transition-all duration-300 placeholder:text-neutral-700 focus:border-accent focus:bg-accent/[0.02] focus:shadow-[0_0_0_1px_oklch(0.58_0.22_27/0.15)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="group relative">
                <label
                  htmlFor="formEmail"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors group-focus-within:text-accent"
                >
                  Email
                </label>
                <input
                  id="formEmail"
                  type="email"
                  placeholder=""
                  className="w-full border border-input bg-transparent px-4 py-3 font-mono text-sm outline-none transition-all duration-300 placeholder:text-neutral-700 focus:border-accent focus:bg-accent/[0.02] focus:shadow-[0_0_0_1px_oklch(0.58_0.22_27/0.15)]"
                />
              </div>

              {/* Phone with country code */}
              <div className="group relative">
                <label
                  htmlFor="phone"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors group-focus-within:text-accent"
                >
                  Phone number
                </label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <select
                      id="countryCode"
                      className="w-[120px] appearance-none border border-input bg-transparent px-3 py-3 font-mono text-sm outline-none transition-all duration-300 focus:border-accent focus:bg-accent/[0.02] focus:shadow-[0_0_0_1px_oklch(0.58_0.22_27/0.15)] text-muted-foreground"
                    >
                      {countryCodes.map((cc) => (
                        <option key={cc.code} value={cc.code} className="bg-background">
                          {cc.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/50" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder=""
                    className="flex-1 border border-input bg-transparent px-4 py-3 font-mono text-sm outline-none transition-all duration-300 placeholder:text-neutral-700 focus:border-accent focus:bg-accent/[0.02] focus:shadow-[0_0_0_1px_oklch(0.58_0.22_27/0.15)]"
                  />
                </div>
              </div>

              {/* How can we help */}
              <div className="group relative">
                <label
                  htmlFor="help"
                  className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors group-focus-within:text-accent"
                >
                  How can we help?
                </label>
                <textarea
                  id="help"
                  rows={4}
                  placeholder="Tell us about your inquiry…"
                  className="w-full resize-none border border-input bg-transparent px-4 py-3 font-mono text-sm outline-none transition-all duration-300 placeholder:text-neutral-700 focus:border-accent focus:bg-accent/[0.02] focus:shadow-[0_0_0_1px_oklch(0.58_0.22_27/0.15)]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group inline-flex h-14 w-full items-center justify-center gap-3 bg-foreground px-8 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:scale-[0.98]"
              >
                Submit
                <Send className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>

              {/* Agreement text */}
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed text-muted-foreground/50">
                By contacting us, you agree to our{" "}
                <Link to="/terms" className="underline underline-offset-2 hover:text-accent transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
