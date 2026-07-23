import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Marque" },
      {
        name: "description",
        content: "Marque privacy policy — how we collect, use, and protect your personal data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
              Privacy Policy
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
                Information we collect
              </h2>
              <p>
                We collect information you provide directly when you create an account, submit a consignment inquiry,
                contact us, or use our services. This may include your name, email address, phone number, postal
                address, and vehicle-related information.
              </p>
              <p className="mt-4">
                We also automatically collect certain technical data when you visit our platform, including IP address,
                browser type, device information, pages viewed, and session duration. This helps us improve performance
                and tailor your experience.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                How we use your data
              </h2>
              <p>
                Your information is used to facilitate vehicle listings, process consignment requests, verify dealer
                credentials, communicate with you about transactions, and improve our platform. We do not sell personal
                data to third parties.
              </p>
              <p className="mt-4">
                We may share limited information with verified dealers and partners as necessary to complete a
                transaction you have initiated. All partners are contractually bound to protect your data.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Data retention & security
              </h2>
              <p>
                We retain your personal data only as long as necessary to provide our services or comply with legal
                obligations. Industry-standard encryption and access controls are employed to safeguard your
                information against unauthorized access or disclosure.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Your rights
              </h2>
              <p>
                Depending on your jurisdiction, you may have the right to access, correct, delete, or port your
                personal data. You may also opt out of certain data processing activities. To exercise these rights,
                please contact us using the details below.
              </p>
            </div>

            <div>
              <h2 className="mb-4 font-display text-2xl italic uppercase tracking-tighter text-foreground md:text-3xl">
                Contact
              </h2>
              <p>
                For questions about this policy or to exercise your data rights, reach us at{" "}
                <a href="mailto:privacy@marque.example" className="text-accent underline underline-offset-4 hover:text-foreground">
                  privacy@marque.example
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
