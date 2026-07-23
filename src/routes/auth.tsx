import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { checkRateLimit } from "@/lib/rate-limiter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Marque" },
      { name: "description", content: "Sign in or create your Marque account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  displayName: z.string().trim().min(1, "Required").max(100),
  phone: z.string().trim().max(50).optional(),
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: search.redirect ?? "/account", replace: true });
    });
  }, [navigate, search.redirect]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    // Rate limit: max 5 sign-in attempts per email per minute
    if (!checkRateLimit(`signin:${parsed.data.email}`, 5, 60_000)) {
      setBusy(false);
      toast.error("Too many attempts. Try again in a minute.");
      return;
    }
    setBusy(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("Please verify your email before signing in.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Redirect admins straight to the admin dashboard
    if (signInData?.user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signInData.user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      if (isAdmin) {
        toast.success("Welcome back.");
        navigate({ to: "/admin", replace: true });
        return;
      }
    }

    sessionStorage.setItem("marque_welcome", "true");
    navigate({ to: search.redirect ?? "/account", replace: true });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
      displayName: fd.get("displayName"),
      phone: fd.get("phone") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    // Rate limit: max 3 sign-up attempts per email per 15 minutes
    if (!checkRateLimit(`signup:${parsed.data.email}`, 3, 900_000)) {
      setBusy(false);
      toast.error("Too many attempts. Try again later.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth-callback`,
        data: { display_name: parsed.data.displayName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Save phone to profile if provided
    if (data.user && parsed.data.phone) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        phone: parsed.data.phone,
      }).eq("id", data.user.id);
    }

    if (data.user && !data.session) {
      toast.success("Check your inbox to verify your email.");
    } else {
      toast.success("Account created.");
      sessionStorage.setItem("marque_welcome", "true");
      navigate({ to: search.redirect ?? "/account", replace: true });
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tighter">
            MARQUE
          </Link>
          <p className="eyebrow mt-6 text-accent">Access the garage</p>
          <h1 className="mt-3 font-display text-3xl italic uppercase tracking-tighter">
            Sign in or join.
          </h1>
        </div>

        <Tabs defaultValue={search.mode === "signup" ? "signup" : "signin"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border border-border rounded-none h-12">
            <TabsTrigger value="signin" className="rounded-none font-mono text-[10px] uppercase tracking-[0.3em]">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-none font-mono text-[10px] uppercase tracking-[0.3em]">
              Create account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-8">
            <form onSubmit={handleSignIn} className="space-y-5">
              <Field name="email" label="Email" type="email" autoComplete="email" required />
              <Field name="password" label="Password" type="password" autoComplete="current-password" required />
              <Button type="submit" disabled={busy} className="w-full rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em]">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-8">
            <form onSubmit={handleSignUp} className="space-y-5">
              <Field name="email" label="Email" type="email" autoComplete="email" required />
              <Field
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                hint="Minimum 6 characters"
              />
              <Field name="displayName" label="Display name" autoComplete="name" required />
              <Field
                name="phone"
                label="Phone (optional)"
                type="tel"
                autoComplete="tel"
                hint="For dealer handoff"
              />
              <Button type="submit" disabled={busy} className="w-full rounded-none h-12 font-mono text-[11px] uppercase tracking-[0.3em]">
                {busy ? "Creating…" : "Create account"}
              </Button>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                We'll send a verification email.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  required,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          required={required}
          className={`rounded-none border-border bg-transparent h-12 ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={revealed ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {hint ? <p className="font-mono text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

