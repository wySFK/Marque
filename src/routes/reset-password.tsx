import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(6, "At least 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Supabase JS auto-parses the recovery hash on page load and fires PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/account", replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tighter">
            MARQUE
          </Link>
          <p className="eyebrow mt-6 text-accent">New credential</p>
          <h1 className="mt-3 font-display text-3xl italic uppercase tracking-tighter">
            Set new password.
          </h1>
        </div>
        {!ready ? (
          <div className="border border-border p-8 text-center text-sm text-muted-foreground">
            Open this page from the reset link in your email. If the link expired, request a new one.
            <div className="mt-6">
              <Link to="/forgot-password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                Request new link
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="rounded-none border-border bg-transparent h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((r) => !r)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="rounded-none border-border bg-transparent h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((r) => !r)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em]">
              {busy ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
