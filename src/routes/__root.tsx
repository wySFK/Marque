import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { Preloader } from "@/components/site/Preloader";
import { SideRail, MobileTopBar } from "@/components/site/SideRail";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-6 text-accent">Error 404</p>
        <h1 className="font-display text-6xl italic uppercase tracking-tighter text-foreground">
          Off route.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The vehicle you were tracking is no longer in inventory.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center border border-white/20 px-8 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
          >
            Return to garage
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-6 text-accent">System fault</p>
        <h1 className="font-display text-5xl italic uppercase tracking-tighter">
          Diagnostics required.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Something went wrong on our end. Restart the session below.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-12 items-center justify-center bg-foreground px-8 font-mono text-[11px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center border border-white/20 px-8 font-mono text-[11px] uppercase tracking-[0.3em] text-foreground transition-colors hover:border-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Marque" },
      {
        name: "description",
        content:
          "Marque is a premium online marketplace for buying, selling, and managing high-performance vehicles. Verified dealers, editorial listings, transparent provenance.",
      },
      { name: "author", content: "Marque" },
      { name: "theme-color", content: "#050505" },
      { property: "og:title", content: "Marque — Precision, curated." },
      {
        property: "og:description",
        content:
          "A premium marketplace for buying, selling, and managing high-performance vehicles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Marque — Precision, curated." },
      {
        name: "twitter:description",
        content:
          "A premium marketplace for buying, selling, and managing high-performance vehicles.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.jpg", type: "image/jpeg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function SmoothScroll() {
  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    // Dynamic imports to keep SSR safe and small
    let lenis: any;
    let gsap: any;
    let ScrollTrigger: any;

    (async () => {
      const Lenis = (await import("lenis")).default;
      const gsapModule = await import("gsap");
      const st = await import("gsap/ScrollTrigger");

      gsap = gsapModule.gsap ?? gsapModule.default ?? gsapModule;
      ScrollTrigger = st.ScrollTrigger ?? st.default ?? st;
      gsap.registerPlugin && gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis();

      // Sync Lenis -> ScrollTrigger
      lenis.on("scroll", () => {
        try {
          ScrollTrigger.update();
        } catch (e) {
          /* ignore */
        }
      });

      // Drive Lenis from GSAP ticker
      gsap.ticker.add((time: number) => {
        if (lenis?.raf) lenis.raf(time * 1000);
      });

      // Prevent lag smoothing delaying ticker updates
      if (gsap.ticker.lagSmoothing) gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      try {
        // best-effort cleanup; modules may not be loaded
        (async () => {
          const st = await import("gsap/ScrollTrigger");
          const ScrollTrigger = st.ScrollTrigger ?? st.default ?? st;
          ScrollTrigger.getAll && ScrollTrigger.getAll().forEach((t: any) => t.kill());
        })();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  return null;
}

function AnimatedOutlet() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-fade-in">
      <Outlet />
    </div>
  );
}

const AUTH_PATHS = new Set(["/auth", "/forgot-password", "/reset-password", "/auth-callback"]);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const showSidebar = useMemo(() => !AUTH_PATHS.has(location.pathname), [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Preloader />
      <AuthSync />
      <SmoothScroll />
      {showSidebar && <SideRail />}
      {showSidebar && <MobileTopBar />}
      <AnimatedOutlet />
      <Toaster />
    </QueryClientProvider>
  );
}
