import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Marque" },
      {
        name: "description",
        content: "Marque terms of service — the conditions governing your use of our automotive marketplace.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        <section className="relative border-b border-border px-6 pt-28 pb-16 md:px-12 md:pt-40 md:pb-20">
          <Link
            to="/"
            className="absolute left-6 top-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground md:left-12 md:top-12"
          >
            <ArrowLeft className="size-3" />
            Back
          </Link>
          <div className="animate-reveal">
            <p className="eyebrow mb-4 text-accent">Legal</p>
            <h1 className="font-display text-5xl italic uppercase leading-[0.9] tracking-tighter md:text-7xl">
              Terms of Service
            </h1>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Last updated: July 2026
            </p>
          </div>
        </section>

        <section className="px-6 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-3xl space-y-12 text-sm leading-relaxed text-muted-foreground md:text-base">
            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Acceptance
              </h2>
              <p>
                By accessing or using the Marque platform, you agree to be bound by these Terms of Service. If you do
                not agree, please refrain from using our services. These terms may be updated periodically, and
                continued use constitutes acceptance of any changes.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Listings & accuracy
              </h2>
              <p>
                Vehicle listings on Marque are provided by dealers and private sellers. While we review submissions
                for editorial quality, we do not guarantee the accuracy, completeness, or condition of any listed
                vehicle. Buyers are encouraged to conduct independent inspections and verifications.
              </p>
              <p className="mt-4">
                Sellers agree to provide truthful and accurate information about their vehicles. Misrepresentation
                may result in immediate removal of listings and suspension of account privileges.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Transactions
              </h2>
              <p>
                Marque facilitates introductions between buyers and sellers but is not a party to any sale
                transaction. All financial arrangements, title transfers, and contractual obligations are the sole
                responsibility of the transacting parties. We recommend that all purchases be conducted with
                appropriate legal and mechanical due diligence.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Account responsibilities
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activity conducted under your account. Notify us immediately of any unauthorized use. We reserve the
                right to suspend or terminate accounts that violate these terms.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Limitation of liability
              </h2>
              <p>
                Marque shall not be liable for any indirect, incidental, or consequential damages arising from your
                use of the platform, including but not limited to transaction disputes, vehicle condition, or data
                loss. Our total liability is limited to the maximum extent permitted by applicable law.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Contact
              </h2>
              <p>
                Questions about these terms can be directed to{" "}
                <a href="mailto:legal@marque.example" className="text-accent underline underline-offset-4 hover:text-foreground">
                  legal@marque.example
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
