import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth-callback")({
  head: () => ({
    meta: [
      { title: "Confirming — Marque" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase JS parses the URL hash/query and sets the session automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        toast.success("Email verified.");
        navigate({ to: "/account", replace: true });
      }
    });
    // Fallback: if we already have a session, go straight to account
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account", replace: true });
    });
    // Timeout guard
    const t = window.setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) navigate({ to: "/auth", replace: true });
      });
    }, 4000);
    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(t);
    };
  }, [navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center">
        <p className="eyebrow text-accent">One moment</p>
        <h1 className="mt-3 font-display text-3xl italic uppercase tracking-tighter">
          Confirming session…
        </h1>
      </div>
    </main>
  );
}
