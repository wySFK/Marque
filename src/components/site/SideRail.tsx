import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { label: "Inventory", to: "/cars" },
  { label: "Dealers", to: "/dealers" },
  { label: "Sell", to: "/sell" },
] as const;

// Module-level cache so SideRail doesn't flash on remount
let _roleCache: { userId: string; isAdmin: boolean } | null = null;

export function SideRail() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setCheckingRole(false);
      _roleCache = null;
      return;
    }
    // Cache hit - use immediately, no flash
    if (_roleCache && _roleCache.userId === user.id) {
      setIsAdmin(_roleCache.isAdmin);
      setCheckingRole(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(
        ({ data }) => {
          const admin = (data ?? []).some((r) => r.role === "admin");
          setIsAdmin(admin);
          _roleCache = { userId: user.id, isAdmin: admin };
          setCheckingRole(false);
        },
        () => setCheckingRole(false),
      );
  }, [user, loading]);

  // Determine which link to show
  const isReady = !loading && !checkingRole;

  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 top-0 z-50 hidden h-full w-16 flex-col items-center border-r border-border bg-background py-8 md:flex"
    >
      <Link
        to="/"
        className="mb-12 block font-display text-xl font-extrabold tracking-tighter text-foreground transition-all hover:opacity-70 active:scale-95"
        aria-label="Marque home"
      >
        M
      </Link>
      <div className="flex flex-1 flex-col items-center gap-8">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-all hover:text-foreground hover:opacity-100 active:opacity-60"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {item.label}
          </Link>
        ))}
        {isReady && !isAdmin && (
          <Link
            to={user ? "/account" : "/auth"}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent transition-all hover:text-foreground active:opacity-60"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {user ? "Account" : "Sign in"}
          </Link>
        )}
        {isReady && isAdmin && (
          <Link
            to="/admin"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent transition-all hover:text-foreground active:opacity-60"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Admin
          </Link>
        )}
      </div>
      <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent" />
    </nav>
  );
}

export function MobileTopBar() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAdmin(false);
      setCheckingRole(false);
      _roleCache = null;
      return;
    }
    if (_roleCache && _roleCache.userId === user.id) {
      setIsAdmin(_roleCache.isAdmin);
      setCheckingRole(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(
        ({ data }) => {
          const admin = (data ?? []).some((r) => r.role === "admin");
          setIsAdmin(admin);
          _roleCache = { userId: user.id, isAdmin: admin };
          setCheckingRole(false);
        },
        () => setCheckingRole(false),
      );
  }, [user, loading]);

  const isReady = !loading && !checkingRole;

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md md:hidden">
      <Link to="/" className="font-display text-lg font-extrabold tracking-tighter">
        MARQUE
      </Link>
      <div className="flex items-center gap-5">
        <Link
          to="/cars"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-all hover:text-foreground active:opacity-60"
        >
          Inventory
        </Link>
        {isReady && isAdmin && (
          <Link
            to="/admin"
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent transition-all hover:text-foreground active:opacity-60"
          >
            Admin
          </Link>
        )}
        {isReady && !isAdmin && (
          <Link
            to={user ? "/account" : "/auth"}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent transition-all hover:text-foreground active:opacity-60"
          >
            {user ? "Account" : "Sign in"}
          </Link>
        )}
      </div>
    </div>
  );
}
