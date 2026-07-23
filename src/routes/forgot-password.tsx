import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit } from "@/lib/rate-limiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({ email: z.string().trim().email().max(255) });

function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email") });
    if (!parsed.success) {
      toast.error("Enter a valid email");
      return;
    }
    // Rate limit: max 3 password reset requests per email per 15 minutes
    if (!checkRateLimit(`reset:${parsed.data.email}`, 3, 900_000)) {
      setBusy(false);
      toast.error("Too many attempts. Try again later.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tighter">
            MARQUE
          </Link>
          <p className="eyebrow mt-6 text-accent">Recover access</p>
          <h1 className="mt-3 font-display text-3xl italic uppercase tracking-tighter">
            Reset password.
          </h1>
        </div>
        {sent ? (
          <div className="border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              If that email exists, a reset link is on its way. It expires in 1 hour.
            </p>
            <Link
              to="/account"
              className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-accent"
            >
              Back to account
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Email
              </Label>
              <Input id="email" name="email" type="email" required className="rounded-none border-border bg-transparent h-12" />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em]">
              {busy ? "Sending…" : "Send reset link"}
            </Button>
            <div className="text-center">
              <Link to="/account" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
                Back to account
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
