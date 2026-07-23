import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  ChevronRight,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import { catalog, fmtPrice } from "@/data/cars";
import type { CarListing } from "@/data/cars";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Marque" },
      {
        name: "description",
        content: "View your saved cart items at Marque.",
      },
      { property: "og:title", content: "Cart — Marque" },
    ],
  }),
  component: CartPage,
});

type CheckoutStep = "cart" | "inquiry" | "confirm";

function CartPage() {
  const [cartIds, setCartIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("marque_cart");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");

  // If user clears all items while on the inquiry step, go back to cart
  useEffect(() => {
    if (cartIds.size === 0 && checkoutStep === "inquiry") {
      setCheckoutStep("cart");
    }
  }, [cartIds.size, checkoutStep]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("marque_cart", JSON.stringify([...cartIds]));
  }, [cartIds]);

  const cartItems = useMemo(() => {
    return catalog.filter((c) => cartIds.has(c.id));
  }, [cartIds]);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, c) => sum + c.price, 0);
  }, [cartItems]);

  const removeFromCart = (carId: string) => {
    setCartIds((prev) => {
      const next = new Set(prev);
      next.delete(carId);
      return next;
    });
    toast.success("Removed from cart.");
  };

  const clearCart = () => {
    setCartIds(new Set());
    toast.success("Cart cleared.");
  };

  const handleInquirySuccess = () => {
    setCartIds(new Set());
    setCheckoutStep("confirm");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        {/* HEADER */}
        <section className="border-b border-border px-6 py-16 md:px-12 md:py-20">
          <div className="animate-reveal mx-auto max-w-5xl">
            <Link
              to="/cars"
              className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to inventory
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow text-accent flex items-center gap-2">
                  {checkoutStep === "cart" ? (
                    <ShoppingCart className="size-4" />
                  ) : checkoutStep === "inquiry" ? (
                    <Building2 className="size-4" />
                  ) : (
                    <CheckCircle className="size-4" />
                  )}
                  {checkoutStep === "cart"
                    ? "Cart"
                    : checkoutStep === "inquiry"
                      ? "Inquiry"
                      : "Submitted"}
                </p>
                <h1 className="mt-4 font-display text-5xl italic uppercase leading-[0.9] tracking-tighter md:text-7xl">
                  {checkoutStep === "cart"
                    ? "Your selections."
                    : checkoutStep === "inquiry"
                      ? "Contact the dealers."
                      : "Inquiry sent."}
                </h1>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  {checkoutStep === "cart" &&
                    `${cartItems.length} ${cartItems.length === 1 ? "vehicle" : "vehicles"} · ${fmtPrice(totalPrice)} total`}
                  {checkoutStep === "inquiry" &&
                    "Dealers typically respond within 24 hours"}
                  {checkoutStep === "confirm" &&
                    "The dealers will reach out to you shortly"}
                </p>
              </div>
              {checkoutStep === "cart" && cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </button>
              )}
              {checkoutStep === "inquiry" && (
                <button
                  type="button"
                  onClick={() => setCheckoutStep("cart")}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to cart
                </button>
              )}
            </div>
          </div>
        </section>

        {/* CART ITEMS / INQUIRY / CONFIRM */}
        <section className="px-6 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            {checkoutStep === "cart" && (
              <>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center border border-border p-16 text-center">
                    <ShoppingBag className="mb-6 size-12 text-muted-foreground" />
                    <p className="font-display text-2xl italic tracking-tight">
                      Your cart is empty.
                    </p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Browse the inventory to add vehicles.
                    </p>
                    <Link
                      to="/cars"
                      className="mt-8 inline-flex h-12 items-center justify-center bg-foreground px-6 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      View inventory
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {cartItems.map((car) => (
                      <CartItemRow
                        key={car.id}
                        car={car}
                        onRemove={() => removeFromCart(car.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Total + Inquiry button */}
                {cartItems.length > 0 && (
                  <div className="mt-10 flex flex-col gap-6 border-t border-border pt-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Total ({cartItems.length} vehicles)
                      </p>
                      <p className="font-display text-3xl italic tracking-tight md:text-4xl">
                        {fmtPrice(totalPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("inquiry")}
                      className="group inline-flex h-14 items-center justify-center gap-3 bg-foreground px-10 font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-all duration-300 hover:bg-accent hover:text-accent-foreground active:scale-[0.97] self-center"
                    >
                      <Send className="size-4 transition-transform group-hover:scale-110" />
                      Submit inquiry
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </>
            )}

            {checkoutStep === "inquiry" && (
              <InquiryForm
                cartItems={cartItems}
                totalPrice={totalPrice}
                onSuccess={handleInquirySuccess}
              />
            )}

            {checkoutStep === "confirm" && <Confirmation />}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

/* ─── Cart Item Row ───────────────────────────────────────── */

function CartItemRow({
  car,
  onRemove,
}: {
  car: CarListing;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 py-6 md:flex-row md:gap-8 md:py-8">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900 md:w-56 md:aspect-[4/3]">
        <img
          src={car.image}
          alt={car.name}
          className="h-full w-full object-cover"
        />
        <span
          className={`absolute left-3 top-3 px-2 py-0.5 font-mono text-[8px] tracking-widest backdrop-blur ${
            car.status === "SOLD"
              ? "bg-background/80 text-muted-foreground line-through"
              : car.status === "RESERVED"
                ? "bg-accent/90 text-accent-foreground"
                : "bg-background/80"
          }`}
        >
          {car.status}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-accent text-[10px]">{car.category}</p>
              <h3 className="mt-1 font-display text-2xl italic uppercase tracking-tight md:text-3xl">
                {car.name}
              </h3>
            </div>
            <p className="text-right font-display text-xl italic tracking-tight md:text-2xl">
              {fmtPrice(car.price)}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase text-muted-foreground">
            <span>{car.year}</span>
            <span>{car.engine}</span>
            <span>{car.hp} HP</span>
            <span>{car.mileage.toLocaleString()} km</span>
            <span>{car.location}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Inquiry Form ────────────────────────────────────────── */

type InquiryDetails = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

function InquiryForm({
  cartItems,
  totalPrice,
  onSuccess,
}: {
  cartItems: CarListing[];
  totalPrice: number;
  onSuccess: () => void;
}) {
  const [details, setDetails] = useState<InquiryDetails>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryDetails, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Unique dealers from cart items
  const dealers = useMemo(() => {
    const seen = new Set<string>();
    return cartItems.filter((c) => {
      if (seen.has(c.dealer)) return false;
      seen.add(c.dealer);
      return true;
    });
  }, [cartItems]);

  const updateField = (field: keyof InquiryDetails, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!details.name.trim()) {
      next.name = "Name is required";
    }
    if (!details.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      next.email = "Enter a valid email";
    }
    if (!details.phone.trim()) {
      next.phone = "Phone number is required";
    } else if (!/^[\d\s\-+()]{7,}$/.test(details.phone)) {
      next.phone = "Enter a valid phone number";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Simulate sending the inquiry
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Inquiry sent! Dealers will respond within 24 hours.");
      onSuccess();
    }, 1500);
  };

  const inputClass = (field: keyof InquiryDetails) =>
    `w-full bg-transparent border-b px-0 py-3 text-base font-medium outline-none transition-colors placeholder:text-neutral-600 focus:border-accent ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="grid gap-10 md:grid-cols-5">
        {/* Form fields */}
        <div className="space-y-8 md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Your contact details
          </p>

          {/* Name */}
          <div>
            <label className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Full name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Your full name"
                value={details.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={inputClass("name")}
                autoComplete="name"
              />
              <User className="absolute right-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.name && (
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="your@email.com"
                value={details.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass("email")}
                autoComplete="email"
              />
              <Mail className="absolute right-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.email && (
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Phone number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={details.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClass("phone")}
                autoComplete="tel"
              />
              <Phone className="absolute right-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.phone && (
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-destructive">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="mb-2 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Message <span className="text-neutral-600">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                placeholder="Any specific questions or requests for the dealer..."
                value={details.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={3}
                className={`${inputClass("message")} resize-none`}
              />
              <MessageSquare className="absolute right-0 top-3 size-4 text-muted-foreground" />
            </div>
          </div>

          {/* Note */}
          <div className="flex items-center gap-3 border-t border-border pt-6">
            <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
            <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground">
              Your details will be shared with the dealers of the selected vehicles. No spam, no commitment.
            </p>
          </div>
        </div>

        {/* Dealers overview */}
        <div className="border border-border p-6 md:col-span-2 md:self-start">
          <p className="mb-6 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Dealers
          </p>

          <div className="space-y-4">
            {dealers.map((car) => (
              <div key={car.dealer} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider">
                      {car.dealer}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {car.name}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {fmtPrice(car.price)}
                  </p>
                </div>
                <p className="mt-1.5 font-mono text-[8px] uppercase tracking-wider text-accent">
                  Response time: {car.dealerResponseTime}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <div className="flex justify-between font-mono text-[10px] uppercase">
              <span className="text-muted-foreground">{cartItems.length} {cartItems.length === 1 ? "vehicle" : "vehicles"}</span>
              <span className="font-display text-base italic tracking-tight">
                {fmtPrice(totalPrice)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 bg-foreground font-mono text-[11px] uppercase tracking-[0.25em] text-background transition-all duration-300 hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.97]"
          >
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Sending…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send inquiry
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ─── Confirmation ────────────────────────────────────────── */

function Confirmation() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center border border-border p-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent/20">
        <CheckCircle className="size-8 text-accent" />
      </div>
      <p className="font-display text-3xl italic uppercase tracking-tighter md:text-4xl">
        Inquiry submitted.
      </p>
      <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Your inquiry has been sent to the dealers. They will reach out within 24 hours
        to discuss availability, pricing, delivery, and next steps.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/cars"
          className="inline-flex h-12 items-center justify-center bg-foreground px-8 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Browse inventory
        </Link>
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center border border-white/20 px-8 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
