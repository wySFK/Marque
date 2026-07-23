import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Car,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowLeft,
  LogOut,
  Landmark,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { catalog, fmtPrice } from "@/data/cars";
import type { CarListing } from "@/data/cars";

export const Route = createFileRoute("/_authenticated/dealer")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isDealer = (roles ?? []).some((r) => r.role === "dealer");
    if (!isDealer) {
      throw new Error("You don't have dealer access.");
    }
  },
  head: () => ({
    meta: [
      { title: "Dealer Dashboard — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => {
    const navigate = useNavigate();
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 md:pl-16">
        <div className="text-center">
          <p className="eyebrow text-accent">Access restricted</p>
          <h1 className="mt-4 font-display text-4xl italic uppercase tracking-tighter">
            Dealer access only.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error.message}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/account"
              className="inline-flex h-12 items-center justify-center border border-border px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground hover:border-accent"
            >
              Go to account
            </Link>
            <Link
              to="/apply"
              className="inline-flex h-12 items-center justify-center bg-foreground px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-background hover:bg-accent"
            >
              Apply as a dealer
            </Link>
          </div>
        </div>
      </main>
    );
  },
  component: DealerPage,
});

type ApplicationInfo = {
  id: string;
  business_name: string;
  business_address: string;
  tax_id: string;
  inventory_focus: string;
  phone: string;
  website: string | null;
  status: string;
  created_at: string;
};

type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  routing_number: string;
};

type DealerTab = "listings" | "profile" | "bank";

function DealerPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [application, setApplication] = useState<ApplicationInfo | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DealerTab>("listings");

  useEffect(() => {
    (async () => {
      // Check dealer role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isDealer = (roles ?? []).some((r) => r.role === "dealer");
      if (!isDealer) {
        navigate({ to: "/account", replace: true });
        return;
      }

      // Fetch application data
      const { data: appData } = await supabase
        .from("dealer_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setApplication(appData as ApplicationInfo | null);

      // Fetch bank account
      const { data: bankData } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setBankAccount(bankData as BankAccount | null);

      setLoading(false);
    })();
  }, [user.id, navigate]);

  // Filter catalog to match this dealer's business name
  const myListings = useMemo(() => {
    if (!application?.business_name) return [];
    const name = application.business_name.toLowerCase().trim();
    // 1. Prefer exact match (case-insensitive)
    const exact = catalog.filter((c) => c.dealer.toLowerCase() === name);
    if (exact.length > 0) return exact;
    // 2. Fall back to word-level matching — all significant words must appear
    const words = name.split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) return [];
    return catalog.filter((c) => {
      const dealer = c.dealer.toLowerCase();
      return words.every((w) => dealer.includes(w));
    });
  }, [application]);

  const totalValue = useMemo(
    () => myListings.reduce((sum, c) => sum + c.price, 0),
    [myListings],
  );

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="md:pl-16">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <Building2 className="size-5 text-blue-400" />
                <p className="eyebrow text-blue-400">Dealer portal</p>
              </div>
              <h1 className="mt-4 font-display text-5xl italic uppercase leading-[0.9] tracking-tighter md:text-6xl">
                {application?.business_name ?? "Your Dealership"}.
              </h1>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {user.email} · verified dealer
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to home
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="size-3.5" />
                Sign out
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="mt-12 grid gap-4 sm:grid-cols-4">
            <div className="border border-border p-5">
              <Car className="mb-3 size-5 text-accent" />
              <p className="font-display text-3xl italic tracking-tight">{myListings.length}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Listed vehicles
              </p>
            </div>
            <div className="border border-border p-5">
              <DollarSign className="mb-3 size-5 text-accent" />
              <p className="font-display text-3xl italic tracking-tight">{fmtPrice(totalValue)}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Total value
              </p>
            </div>
            <div className="border border-border p-5">
              <Heart className="mb-3 size-5 text-accent" />
              <p className="font-display text-3xl italic tracking-tight">—</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Saved by buyers
              </p>
            </div>
            <div className="border border-border p-5">
              <Clock className="mb-3 size-5 text-accent" />
              <p className="font-display text-3xl italic tracking-tight">—</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Inquiries
              </p>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-12 flex flex-wrap gap-1 border-b border-border">
            {[
              { key: "listings" as DealerTab, label: "Listings", icon: Car },
              { key: "profile" as DealerTab, label: "Profile", icon: Building2 },
              { key: "bank" as DealerTab, label: "Bank Account", icon: Landmark },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] transition-all duration-200 ${
                    activeTab === tab.key
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="mt-10">
            {/* ─── LISTINGS ─── */}
            {activeTab === "listings" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {myListings.length} vehicle{myListings.length !== 1 ? "s" : ""} listed
                  </p>
                  <Link
                    to="/sell"
                    className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-accent hover:text-foreground transition-colors"
                  >
                    + Add listing
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>

                {myListings.length === 0 ? (
                  <div className="border border-border p-16 text-center">
                    <Car className="mx-auto mb-4 size-8 text-muted-foreground" />
                    <p className="font-display text-2xl italic tracking-tight">No listings yet.</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Start by listing your first vehicle.
                    </p>
                    <Link
                      to="/sell"
                      className="mt-6 inline-flex h-12 items-center justify-center border border-border px-8 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground hover:border-accent hover:text-accent"
                    >
                      List a vehicle
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50 border border-border">
                    {myListings.map((car) => (
                      <div key={car.id} className="flex items-center gap-5 p-5">
                        <div className="size-16 shrink-0 overflow-hidden bg-neutral-900">
                          <img
                            src={car.image}
                            alt={car.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold tracking-tight">{car.name}</h3>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {car.year} · {car.engine} · {car.hp} HP
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{fmtPrice(car.price)}</p>
                          <span
                            className={`mt-1 inline-block font-mono text-[9px] uppercase tracking-widest ${
                              car.status === "AVAILABLE"
                                ? "text-green-500"
                                : car.status === "RESERVED"
                                  ? "text-yellow-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {car.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── PROFILE ─── */}
            {activeTab === "profile" && (
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Business details
                </p>
                <div className="mt-6 grid gap-px bg-border/60">
                  {[
                    { label: "Business name", value: application?.business_name },
                    { label: "Address", value: application?.business_address },
                    { label: "Tax ID / EIN", value: application?.tax_id },
                    { label: "Phone", value: application?.phone },
                    { label: "Website", value: application?.website || "—" },
                    { label: "Inventory focus", value: application?.inventory_focus },
                    { label: "Status", value: application?.status },
                    { label: "Member since", value: application?.created_at ? new Date(application.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—" },
                  ].map((row) => (
                    <div key={row.label} className="bg-background p-4 sm:grid sm:grid-cols-[180px_1fr] sm:gap-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="mt-1 sm:mt-0 font-mono text-[12px] font-bold tracking-tight text-foreground">
                        {row.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── BANK ACCOUNT ─── */}
            {activeTab === "bank" && (
              <div className="max-w-2xl">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Payout account
                </p>
                {!bankAccount ? (
                  <div className="mt-6 border border-border p-12 text-center">
                    <Landmark className="mx-auto mb-4 size-8 text-muted-foreground" />
                    <p className="font-display text-2xl italic tracking-tight">No bank account linked.</p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Link a bank account to receive payouts.
                    </p>
                    <Link
                      to="/account"
                      className="mt-6 inline-flex h-12 items-center justify-center border border-border px-8 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground hover:border-accent hover:text-accent"
                    >
                      Go to account
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-px bg-border/60">
                    {[
                      { label: "Bank name", value: bankAccount.bank_name },
                      { label: "Account holder", value: bankAccount.account_name },
                      { label: "Account number", value: `••••${bankAccount.account_number.slice(-4)}` },
                      { label: "Routing number", value: bankAccount.routing_number },
                    ].map((row) => (
                      <div key={row.label} className="bg-background p-4 sm:grid sm:grid-cols-[180px_1fr] sm:gap-6">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {row.label}
                        </p>
                        <p className="mt-1 sm:mt-0 font-mono text-[12px] font-bold tracking-tight text-foreground">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    to="/account"
                    className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-accent hover:text-foreground transition-colors"
                  >
                    Manage in account settings
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
