import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Upload,
  X,
  ScanFace,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/site/Footer";
import {
  createVerificationSession,
  checkVerificationStatus,
} from "@/lib/identity-verification";

export const Route = createFileRoute("/_authenticated/apply")({
  head: () => ({
    meta: [
      { title: "Become a Dealer — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApplyPage,
});

type ApplicationStatus = "pending" | "approved" | "rejected";

type ExistingApplication = {
  id: string;
  business_name: string;
  business_address: string;
  tax_id: string;
  inventory_focus: string;
  phone: string;
  website: string | null;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  verification_status: string | null;
  rejection_reason: string | null;
  resubmitted_at: string | null;
};

type VerificationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "redirecting" }
  | { status: "verified" }
  | { status: "requires_input"; message: string }
  | { status: "pending" }
  | { status: "error"; message: string };

const applySchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(200),
  business_address: z.string().trim().min(1, "Business address is required").max(500),
  tax_id: z.string().trim().min(1, "Tax ID / EIN is required").max(100),
  inventory_focus: z.string().trim().min(1, "Inventory focus is required").max(500),
  phone: z.string().trim().min(1, "Phone is required").max(50),
  website: z.string().trim().max(500).optional(),
  message: z.string().trim().max(2000).optional(),
});

function ApplyPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<ExistingApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reapplying, setReapplying] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [verification, setVerification] = useState<VerificationState>({
    status: "idle",
  });
  const checkRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Handle returning from Stripe Identity verification ──
  useEffect(() => {
    if (checkRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const stripeSessionId = params.get("stripe_session_id");

    const sessionToCheck = sessionId || stripeSessionId;
    if (!sessionToCheck) return;

    checkRef.current = true;

    (async () => {
      setVerification({ status: "loading" });
      try {
        const result = await checkVerificationStatus({
          data: { sessionId: sessionToCheck },
        });

        if (result.status === "verified") {
          setVerification({ status: "verified" });
          toast.success("Identity verified successfully!");
        } else if (result.status === "requires_input") {
          setVerification({
            status: "requires_input",
            message:
              "We couldn't verify your identity. The document may be blurry or incomplete. Please try again.",
          });
        } else if (result.status === "pending") {
          setVerification({
            status: "pending",
          });
        } else {
          setVerification({
            status: "error",
            message: "Verification failed. Please try again.",
          });
        }

        // Clean URL
        navigate({ to: "/apply", replace: true });
      } catch (err: any) {
        setVerification({
          status: "error",
          message: err.message || "Verification check failed.",
        });
        navigate({ to: "/apply", replace: true });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("dealer_applications")
        .select("id, business_name, business_address, tax_id, inventory_focus, phone, website, message, status, created_at, verification_status, rejection_reason, resubmitted_at")
        .eq("user_id", user.id)
        .maybeSingle();
      setExisting(data as ExistingApplication | null);

      // Pre-set verification state if already verified
      if (data?.verification_status === "verified") {
        setVerification({ status: "verified" });
      }

      setLoading(false);
    })();
  }, [user.id]);

  // ── Start Stripe Identity verification ──
  const handleVerifyIdentity = async () => {
    setVerification({ status: "loading" });
    try {
      const returnUrl = `${window.location.origin}/apply`;
      const result = await createVerificationSession({
        data: { returnUrl },
      });

      if (result.url) {
        setVerification({ status: "redirecting" });
        // Redirect to Stripe's hosted verification page
        window.location.href = result.url;
      } else {
        setVerification({
          status: "error",
          message: "Failed to create verification session.",
        });
      }
    } catch (err: any) {
      setVerification({
        status: "error",
        message:
          err.message === "STRIPE_SECRET_KEY is not configured"
            ? "Identity verification is not configured yet. Please contact support."
            : err.message || "Something went wrong. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = applySchema.safeParse({
      business_name: fd.get("business_name"),
      business_address: fd.get("business_address"),
      tax_id: fd.get("tax_id"),
      inventory_focus: fd.get("inventory_focus"),
      phone: fd.get("phone"),
      website: fd.get("website") || undefined,
      message: fd.get("message") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);

    // Upload ID file first if provided
    let idFilePath: string | null = null;
    if (idFile) {
      const fileExt = idFile.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from("dealer-documents")
        .upload(fileName, idFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadErr) {
        setSubmitting(false);
        toast.error("Failed to upload ID. Please try again.");
        return;
      }
      idFilePath = fileName;
    }

    let result;
    if (reapplying && existing) {
      // ── Re-apply: update existing record and reset to pending ──
      result = await supabase
        .from("dealer_applications")
        .update({
          ...parsed.data,
          id_file_path: idFilePath,
          status: "pending",
          rejection_reason: null,
          verification_status: null,
          stripe_verification_session_id: null,
          resubmitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // ── New application ──
      result = await supabase
        .from("dealer_applications")
        .insert({ ...parsed.data, user_id: user.id, id_file_path: idFilePath });
    }
    const { error } = result;
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("You already have a pending application.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(reapplying ? "Application re-submitted. We'll be in touch." : "Application submitted. We'll be in touch.");
    setExisting({
      id: existing?.id ?? "",
      business_name: parsed.data.business_name,
      business_address: parsed.data.business_address,
      tax_id: parsed.data.tax_id,
      inventory_focus: parsed.data.inventory_focus,
      phone: parsed.data.phone,
      website: parsed.data.website ?? null,
      message: parsed.data.message ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
      verification_status: null,
      rejection_reason: null,
      resubmitted_at: new Date().toISOString(),
    });
    setReapplying(false);
    setVerification({ status: "idle" });
  };

  // ───────────────────────────────────────────────────────────
  const isVerified = verification.status === "verified";

  // ─── Loading ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="md:pl-16">
          <div className="mx-auto max-w-3xl px-6 py-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  // ─── Already applied: show status (unless re-applying) ───
  if (existing && !reapplying) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="md:pl-16">
          <div className="mx-auto max-w-3xl px-6 py-24">
            <Link
              to="/dealers"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to dealers
            </Link>

            <div className="mt-12 border border-border p-10">
              {existing.status === "pending" && (
                <>
                  <div className="flex size-14 items-center justify-center border border-border bg-surface">
                    <Clock className="size-6 text-accent" />
                  </div>
                  <h1 className="mt-6 font-display text-4xl italic uppercase leading-none tracking-tighter">
                    Application under review.
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    We've received your application for{" "}
                    <span className="text-foreground">{existing.business_name}</span>. Our team
                    will review it and get back to you within 3–5 business days.
                  </p>

                  {/* █████████ Identity Verification — after submission █████████ */}
                  <div className="mt-8 border border-accent/20 bg-accent/[0.03] p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <ScanFace className="size-5 text-accent" />
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                        Identity verification
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We use Stripe Identity to verify your ID document. Stripe checks that the
                      document is authentic and not tampered with. Your data is handled securely
                      by Stripe.
                    </p>

                    {/* Verified */}
                    {verification.status === "verified" && (
                      <div className="mt-5 flex items-start gap-3 rounded-sm border border-green-500/30 bg-green-500/10 p-4">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-500" />
                        <div>
                          <p className="font-bold text-green-500">Identity confirmed ✓</p>
                          <p className="mt-1 font-mono text-[10px] text-green-400/80">
                            Your ID document and selfie have been verified successfully. This
                            confirmation is visible to our admin team during the review.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {verification.status === "error" && (
                      <div className="mt-5 flex items-start gap-3 rounded-sm border border-destructive/30 bg-destructive/10 p-4">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                        <div>
                          <p className="font-bold text-destructive">Verification unavailable</p>
                          <p className="mt-1 font-mono text-[10px] text-destructive/80">
                            {verification.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Requires input */}
                    {verification.status === "requires_input" && (
                      <div className="mt-5 flex items-start gap-3 rounded-sm border border-yellow-500/30 bg-yellow-500/10 p-4">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-500" />
                        <div>
                          <p className="font-bold text-yellow-500">Verification needs attention</p>
                          <p className="mt-1 font-mono text-[10px] text-yellow-400/80">
                            {verification.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pending (processing) */}
                    {verification.status === "pending" && (
                      <div className="mt-5 flex items-start gap-3 rounded-sm border border-accent/30 bg-accent/5 p-4">
                        <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-accent" />
                        <div>
                          <p className="font-bold text-accent">Verification in progress</p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            Your verification is still being processed. Please wait a moment then
                            try again.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Loading */}
                    {verification.status === "loading" && (
                      <div className="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-accent">
                        <Loader2 className="size-4 animate-spin" />
                        Checking verification status…
                      </div>
                    )}

                    {/* Action button — show when NOT verified and NOT redirecting */}
                    {!isVerified && verification.status !== "redirecting" && (
                      <button
                        type="button"
                        onClick={handleVerifyIdentity}
                        disabled={verification.status === "loading"}
                        className="mt-5 inline-flex h-12 items-center justify-center gap-3 bg-accent px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {verification.status === "loading" ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Starting verification…
                          </>
                        ) : (
                          <>
                            <ScanFace className="size-4" />
                            Verify identity with Stripe
                          </>
                        )}
                      </button>
                    )}

                    {/* Redirecting */}
                    {verification.status === "redirecting" && (
                      <div className="mt-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-accent">
                        <Loader2 className="size-4 animate-spin" />
                        Redirecting to Stripe for verification…
                      </div>
                    )}

                    {/* Retry on requires_input */}
                    {verification.status === "requires_input" && (
                      <button
                        type="button"
                        onClick={handleVerifyIdentity}
                        className="mt-4 inline-flex h-10 items-center justify-center gap-2 border border-accent px-4 font-mono text-[10px] uppercase tracking-widest text-accent transition-all hover:bg-accent/10"
                      >
                        <ExternalLink className="size-3.5" />
                        Try again
                      </button>
                    )}

                    {/* Verified badge */}
                    {isVerified && (
                      <div className="mt-5">
                        <span className="inline-flex items-center gap-1.5 border border-green-500/30 bg-green-500/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-green-500">
                          <CheckCircle2 className="size-3" />
                          Verified
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    <Clock className="size-3.5" />
                    Submitted{" "}
                    {new Date(existing.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </>
              )}
              {existing.status === "approved" && (
                <>
                  <div className="flex size-14 items-center justify-center border border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="size-6 text-green-500" />
                  </div>
                  <h1 className="mt-6 font-display text-4xl italic uppercase leading-none tracking-tighter">
                    You're a verified dealer.
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    <span className="text-foreground">{existing.business_name}</span> is now part
                    of the Marque dealer network. Your profile and listings will be managed from
                    your account dashboard.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/account"
                      className="inline-flex h-12 items-center justify-center gap-2 bg-foreground px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-background transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      Go to account
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </>
              )}
              {existing.status === "rejected" && (
                <>
                  <div className="flex size-14 items-center justify-center border border-destructive/30 bg-destructive/10">
                    <XCircle className="size-6 text-destructive" />
                  </div>
                  <h1 className="mt-6 font-display text-4xl italic uppercase leading-none tracking-tighter">
                    Application declined.
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    Unfortunately, we weren't able to approve{" "}
                    <span className="text-foreground">{existing.business_name}</span>'s
                    application at this time.
                  </p>

                  <div className="mt-8 border border-destructive/30 bg-destructive/[0.04] p-6">
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-destructive/60">
                      Reason for rejection
                    </p>
                    <p className="mt-2 font-display text-lg italic leading-snug tracking-tight text-foreground">
                      {existing.rejection_reason || "No specific reason provided."}
                    </p>
                  </div>

                  <div className="mt-8 space-y-3 rounded-sm border border-border/50 bg-surface p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                      What happens next?
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      You're welcome to address the feedback above and submit a new application
                      at any time. If you believe this was a mistake or have questions, please
                      reach out to our team directly.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setReapplying(true);
                        setVerification({ status: "idle" });
                        setIdFile(null);
                        setPreviewUrl(null);
                      }}
                      className="mt-4 inline-flex h-12 items-center justify-center gap-2 bg-accent px-6 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-foreground transition-all hover:opacity-90"
                    >
                      <Building2 className="size-4" />
                      Re-apply with new details
                    </button>

                    <div className="mt-3">
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Return to home
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="md:pl-16">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-16">
          {/* Back link */}
          {reapplying ? (
            <button
              type="button"
              onClick={() => { setReapplying(false); }}
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to status
            </button>
          ) : (
            <Link
              to="/dealers"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to dealers
            </Link>
          )}

          {/* Header */}
          <div className="mt-6">
            <p className="eyebrow text-accent">{reapplying ? "Re-application" : "Dealer intake"}</p>
            <h1 className="mt-3 font-display text-3xl italic uppercase leading-[0.95] tracking-tighter md:text-4xl">
              {reapplying ? "Update and re-submit." : "Apply to join the network."}
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {reapplying
                ? "Address the feedback from your previous application and submit updated details for a fresh review."
                : "Every application is reviewed personally — we follow up within 3–5 business days."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div className="space-y-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80">
                Business details
              </p>

              <Field
                name="business_name"
                label="Business name"
                placeholder="e.g. Rossi Motori"
                required
                defaultValue={reapplying ? existing?.business_name ?? undefined : undefined}
              />
              <Field
                name="business_address"
                label="Business address"
                placeholder="Street, city, country"
                required
                defaultValue={reapplying ? existing?.business_address ?? undefined : undefined}
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  name="tax_id"
                  label="Tax ID / EIN"
                  placeholder="XX-XXXXXXX"
                  required
                  defaultValue={reapplying ? existing?.tax_id ?? undefined : undefined}
                />
                <Field
                  name="phone"
                  label="Phone number"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  required
                  defaultValue={reapplying ? existing?.phone ?? undefined : undefined}
                />
              </div>
              <Field
                name="website"
                label="Website (optional)"
                type="url"
                placeholder="https://example.com"
                defaultValue={reapplying ? existing?.website ?? undefined : undefined}
              />
            </div>

            <div className="space-y-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80">
                Inventory & notes
              </p>

              <div className="space-y-2">
                <Label htmlFor="inventory_focus" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Inventory focus <span className="text-accent">*</span>
                </Label>
                <textarea
                  id="inventory_focus"
                  name="inventory_focus"
                  required
                  rows={3}
                  defaultValue={reapplying ? existing?.inventory_focus ?? undefined : undefined}
                  placeholder="What types of vehicles do you deal in? e.g. Ferrari, Lamborghini, Porsche, concours-grade GT…"
                  className="w-full resize-y border border-border/50 bg-transparent px-4 py-3.5 font-mono text-sm outline-none placeholder:text-neutral-700 focus:border-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Message (optional)
                </Label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  defaultValue={reapplying ? existing?.message ?? undefined : undefined}
                  placeholder="Anything else you'd like us to know about your dealership…"
                  className="w-full resize-y border border-border/50 bg-transparent px-4 py-3.5 font-mono text-sm outline-none placeholder:text-neutral-700 focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* ID Upload — holding ID photo */}
            <div className="space-y-6 border border-accent/20 bg-accent/[0.03] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <ScanFace className="size-5 text-accent" />
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  Photo verification
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of yourself holding your ID document (passport, driver's
                license, or national ID) next to your face. Both your face and the ID must be
                clearly visible. This helps us confirm you physically possess the document.
              </p>

              <div className="space-y-2">
                <Label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Photo of you holding your ID <span className="text-accent">*</span>
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setIdFile(file);
                    setPreviewUrl(file ? URL.createObjectURL(file) : null);
                  }}
                  className="hidden"
                />
                {idFile && previewUrl ? (
                  <div className="flex items-center gap-3 border border-border/50 bg-surface p-4">
                    <img
                      src={previewUrl}
                      alt="Holding ID preview"
                      className="size-16 shrink-0 border border-border/50 bg-neutral-900 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold tracking-tight">{idFile.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {(idFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { URL.revokeObjectURL(previewUrl); setIdFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="flex size-8 shrink-0 items-center justify-center border border-border/50 transition-colors hover:border-accent hover:text-accent"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-3 border border-dashed border-border/50 px-4 py-8 transition-colors hover:border-accent hover:bg-accent/[0.02] group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 group-hover:border-accent/50 transition-colors">
                        <Upload className="size-6 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                          Upload photo with ID
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/50">
                          JPEG or PNG · Max 5 MB
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 pt-4 text-center">
              <Button
                type="submit"
                disabled={submitting || !idFile}
                className="rounded-none h-14 w-full max-w-sm px-8 font-mono text-[11px] uppercase tracking-[0.3em]"
              >
                {submitting
                  ? "Submitting…"
                  : !idFile
                    ? "Upload holding-ID photo first"
                    : reapplying
                      ? "Re-submit application"
                      : "Submit application"}
              </Button>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                We'll review & respond within 3–5 days
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="rounded-none border-border/50 bg-transparent h-12 placeholder:text-neutral-700 focus:border-accent"
      />
    </div>
  );
}
