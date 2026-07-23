import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import img1 from "@/assets/koenigsegg.jpg";
import img2 from "@/assets/ferrari-f40.jpg";
import img3 from "@/assets/porschee.jpg";
import img4 from "@/assets/mclaren.jpg";
import img5 from "@/assets/lambhorgini.jpg";

/* ── Constants ──────────────────────────────────────────── */

const EASE = [0.65, 0, 0.35, 1] as const;

const COUNT_DURATION_MS = 2500;
const COUNT_DURATION_REDUCED_MS = 1500;
const HOLD_AT_FULL_MS = 300;
const SPLIT_MS = 500;

/** 5 intro images for the GSAP fly-in sequence. */
const INTRO_IMAGES = [img1, img2, img3, img4, img5];
const INTRO_ROTATIONS = [-15, 5, -7.5, 10, -2.5];
const INTRO_SCALE = 0.2;
const INTRO_GAP = 40;

/** Which of the 5 intro images becomes the hero (0-indexed). */
const HERO_INDEX = 2;

type Phase = "loading" | "split" | "gsap" | "done";

/**
 * Cinematic intro loader for MARQUE.
 *
 * Sequence:
 *  1. "loading" — plain-black screen with centered "[ MARQUE ] [ N PERCENT ]"
 *     while the percentage counts 0 → 100.
 *  2. "split"   — at 100% the two labels slide apart (MARQUE left, PERCENT right).
 *  3. "gsap"    — GSAP-powered reveal:
 *       a. Preloader bar wipes across the top.
 *       b. Bar wipes back.
 *       c. Overlay clip-path closes, revealing 5 rotated images.
 *       d. Images fly in from off-screen into a centered row.
 *       e. Outer 4 images spread left/right; center image scales to hero.
 *       f. Nav, heading, and social text lines slide up (SplitText).
 *       g. Final fade to reveal the site.
 *
 * SSR-safe: renders nothing on the server, plays once client mounts.
 */

/* ── Helper: initial GSAP image position calculations ── */

function calcPositions() {
  if (typeof window === "undefined") return null;
  const w = window.innerWidth;
  const imgW = w * INTRO_SCALE;
  const rowW = imgW * 5 + INTRO_GAP * 4;
  const centerOffset = (w - rowW) / 2;
  const offScreenL = centerOffset - w * 1.3;

  return INTRO_IMAGES.map((_, i) => {
    const cx =
      centerOffset + i * (imgW + INTRO_GAP) + imgW / 2 - w / 2;
    const ox =
      offScreenL + i * (imgW + INTRO_GAP) + imgW / 2 - w / 2;
    return { centeredX: cx, offScreenX: ox };
  });
}

/* ── Component ─────────────────────────────────────────── */

export function Preloader() {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const gsapRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<ReturnType<typeof calcPositions>>(null);

  // Show the intro on every page load (client-only).
  useEffect(() => {
    setVisible(true);
  }, []);

  // Preload images.
  useEffect(() => {
    if (visible !== true) return;
    INTRO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [visible]);

  // Lock scroll.
  useEffect(() => {
    if (visible !== true || phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible, phase]);

  // Drive 0 → 100 counter, then chain phase transitions.
  useEffect(() => {
    if (visible !== true) return;

    const duration = prefersReduced
      ? COUNT_DURATION_REDUCED_MS
      : COUNT_DURATION_MS;
    const start = performance.now();
    const pending: ReturnType<typeof setTimeout>[] = [];

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        pending.push(
          setTimeout(() => {
            setPhase("split");
            pending.push(
              setTimeout(() => {
                // Reduced motion: skip GSAP, go straight to done
                if (prefersReduced) {
                  setPhase("done");
                  return;
                }
                setPhase("gsap");
              }, SPLIT_MS),
            );
          }, HOLD_AT_FULL_MS),
        );
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pending.forEach(clearTimeout);
    };
  }, [visible, prefersReduced]);

  // ── GSAP animation timeline ──
  useEffect(() => {
    if (phase !== "gsap" || !gsapRef.current) return;

    let killed = false;
    const container = gsapRef.current;

    (async () => {
      const gsapModule = await import("gsap");
      const { default: CustomEase } = await import("gsap/CustomEase");
      const { default: SplitText } = await import("gsap/SplitText");

      const gsap = gsapModule.gsap ?? gsapModule.default ?? gsapModule;
      gsap.registerPlugin(CustomEase, SplitText);

      // Register custom eases (only needs to happen once; re-register is harmless)
      CustomEase.create("hop", "0.9, 0, 0.1, 1");
      CustomEase.create("glide", "0.8, 0, 0.2, 1");

      // Calculate image positions
      const positions = calcPositions();
      if (!positions) return;
      positionsRef.current = positions;

      // ── Set initial GSAP states ──

      const introImgs = container.querySelectorAll<HTMLElement>(".intro-img");

      gsap.set(introImgs, {
        opacity: 1,
        xPercent: -50,
        yPercent: -50,
        top: "50%",
        left: "50%",
        scale: INTRO_SCALE,
        rotation: (i: number) => INTRO_ROTATIONS[i],
        borderRadius: "2.5rem",
        x: (i: number) => positions[i].offScreenX,
      });

      // Set hero image to full position initially
      // (will be overridden in the spread step)

      // ── SplitText ──

      // ── SplitText with mask for slide-up effect ──
      new SplitText(
        container.querySelectorAll<HTMLElement>("nav a, .logo"),
        { type: "lines", linesClass: "line", mask: "lines" },
      );
      new SplitText(
        container.querySelector<HTMLElement>(".hero-header h1"),
        { type: "lines", linesClass: "line", mask: "lines" },
      );
      new SplitText(
        container.querySelectorAll<HTMLElement>(
          ".hero-social p, .hero-social a",
        ),
        { type: "lines", linesClass: "line", mask: "lines" },
      );

      // All .line elements start hidden below their mask
      gsap.set(container.querySelectorAll(".line"), { y: "125%" });

      // ── Scope all targets to container ──

      const preloaderBar =
        container.querySelector<HTMLElement>(".preloader-bar")!;
      const navLines =
        container.querySelectorAll<HTMLElement>("nav .line");
      const headingLines = container.querySelectorAll<HTMLElement>(
        ".hero-header .line",
      );
      const socialLines = container.querySelectorAll<HTMLElement>(
        ".hero-social .line",
      );

      // ── Build timeline ──
      const tl = gsap.timeline({
        onComplete: () => {
          if (!killed) setPhase("done");
        },
      });

      // 1. Preloader bar wipes in
      tl.to(preloaderBar, {
        scaleX: 1,
        duration: 1.5,
        ease: "glide",
        onComplete: () => gsap.set(preloaderBar, { transformOrigin: "right" }),
      });

      // 2. Preloader bar wipes out
      tl.to(preloaderBar, {
        scaleX: 0,
        duration: 1.25,
        ease: "hop",
      });

      // 3. Overlay curtain-clip (separate overlay element, reveals images behind it)
      const overlayEl =
        container.querySelector<HTMLElement>(".preloader-overlay")!;
      tl.to(
        overlayEl,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "hop",
        },
        "<0.75",
      );

      // 4. Intro images fly in to centered row
      tl.to(
        introImgs,
        {
          x: (i: number) => positions[i].centeredX,
          duration: 1.5,
          ease: "glide",
          stagger: 0.025,
        },
        "<0.025",
      );

      // 5. Spread — outer images fly off, center scales to hero
      tl.addLabel("spread");

      // Left two images → off-screen left
      tl.to(
        [introImgs[0], introImgs[1]],
        { x: "-100vw", duration: 1.5, ease: "glide" },
        "spread",
      );

      // Right two images → off-screen right
      tl.to(
        [introImgs[3], introImgs[4]],
        { x: "100vw", duration: 1.5, ease: "glide" },
        "spread",
      );

      // Center image → hero (full viewport, no rotation, no radius)
      tl.to(
        introImgs[HERO_INDEX],
        {
          scale: 1,
          x: 0,
          rotation: 0,
          borderRadius: 0,
          duration: 1.5,
          ease: "glide",
        },
        "<",
      );

      // 6. Text reveals — nav
      tl.to(
        navLines,
        { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
        "<1",
      );

      // 7. Heading
      tl.to(
        headingLines,
        { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
        "<",
      );

      // 8. Social
      tl.to(
        socialLines,
        { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
        "<0.25",
      );

      // 9. Final fade to reveal site
      tl.to(container, {
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    })();

    return () => {
      killed = true;
    };
  }, [phase]);

  if (visible !== true || phase === "done") return null;

  const splitting = phase === "split" || phase === "gsap";
  const showGsap = phase === "gsap";

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] bg-black"
      style={{ pointerEvents: "none" }}
    >
      {/* ── MARQUE counter (loading / split phases) ── */}
      {!showGsap && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="relative z-10 mx-auto w-full max-w-lg px-6 sm:px-10">
            {/* Progress bar above */}
            <div className="mb-8 flex justify-center">
              <div className="h-px w-32 overflow-hidden bg-white/10">
                <motion.div
                  className="h-full origin-left bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </div>

            <div className="flex w-full items-baseline justify-center gap-4 font-mono text-white sm:gap-6">
              <motion.span
                className="text-xs uppercase tracking-[0.35em] sm:text-sm"
                initial={{ opacity: 0, x: 0 }}
                animate={{
                  opacity: splitting ? 0 : 1,
                  x: splitting ? "-45vw" : 0,
                  letterSpacing: splitting ? "0.5em" : "0.35em",
                }}
                transition={{ duration: SPLIT_MS / 1000, ease: EASE }}
                style={{
                  textShadow:
                    progress >= 100
                      ? "0 0 30px oklch(0.58 0.22 27 / 0.5), 0 0 60px oklch(0.58 0.22 27 / 0.2)"
                      : "none",
                }}
              >
                [ MARQUE ]
              </motion.span>

              <motion.span
                className="text-xs tabular-nums tracking-[0.2em] sm:text-sm"
                initial={{ opacity: 0, x: 0 }}
                animate={{
                  opacity: splitting ? 0 : 1,
                  x: splitting ? "45vw" : 0,
                }}
                transition={{ duration: SPLIT_MS / 1000, ease: EASE }}
                style={{
                  color:
                    progress >= 100
                      ? "oklch(0.58 0.22 27)"
                      : "white",
                  textShadow:
                    progress >= 100
                      ? "0 0 20px oklch(0.58 0.22 27 / 0.4)"
                      : "none",
                }}
              >
                [ {progress} PERCENT ]
              </motion.span>
            </div>

            {/* Progress bar below */}
            <div className="mt-8 flex justify-center">
              <div className="h-px w-32 overflow-hidden bg-white/10">
                <motion.div
                  className="h-full origin-left bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </div>

            {/* Stage indicator dots — traffic light sequence */}
            <div className="mt-4 flex justify-center gap-2">
              {(() => {
                const dotDefs = [
                  { threshold: 30, activeColor: "oklch(0.62 0.24 27)" },
                  { threshold: 65, activeColor: "oklch(0.7 0.2 65)" },
                  { threshold: 100, activeColor: "oklch(0.6 0.18 140)" },
                ];
                const activeIdx =
                  progress >= 100 ? 2 : progress >= 65 ? 1 : progress >= 30 ? 0 : -1;

                return dotDefs.map(({ threshold, activeColor }, i) => {
                  const isPast = i < activeIdx;
                  const isCurrent = i === activeIdx;

                  return (
                    <motion.div
                      key={threshold}
                      className="size-1.5 rounded-full"
                      initial={{
                        backgroundColor: "oklch(1 0 0 / 0.15)",
                        scale: 1,
                        boxShadow: "none",
                      }}
                      animate={
                        isPast
                          ? {
                              backgroundColor: activeColor,
                              scale: 1.15,
                              boxShadow: `0 0 6px ${activeColor.replace(")", " / 0.3)")}`,
                            }
                          : isCurrent
                            ? {
                                backgroundColor: activeColor,
                                scale: [1.2, 1.45, 1.2],
                                boxShadow: [
                                  `0 0 6px ${activeColor.replace(")", " / 0.3)")}`,
                                  `0 0 14px ${activeColor.replace(")", " / 0.6)")}`,
                                  `0 0 6px ${activeColor.replace(")", " / 0.3)")}`,
                                ],
                              }
                            : {
                                backgroundColor: "oklch(1 0 0 / 0.15)",
                                scale: 1,
                                boxShadow: "none",
                              }
                      }
                      transition={
                        isCurrent
                          ? {
                              scale: {
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                              boxShadow: {
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                              backgroundColor: { duration: 0.3, ease: "easeOut" },
                            }
                          : { duration: 0.4, ease: "easeOut" }
                      }
                    />
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── GSAP hero section ── */}
      {showGsap && (
        <div ref={gsapRef} className="gsap-preloader absolute inset-0 overflow-hidden bg-black">
          {/* Preloader loading bar */}
          <div
            className="preloader-bar absolute left-0 top-0 z-40 h-[6px] w-full origin-left bg-white"
            style={{ transform: "scaleX(0)", willChange: "transform" }}
          />

          {/* ── Black overlay that clips away to reveal images ── */}
          <div
            className="preloader-overlay pointer-events-none absolute inset-0 z-30 bg-black"
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }}
          />

          {/* Film grain overlay (always visible behind the overlay) */}
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-[0.06] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "120px 120px",
            }}
          />

          {/* Hero container — images live BEHIND the overlay */}
          <div className="relative z-10 h-full w-full">
            {/* ── 5 intro images ── */}
            {INTRO_IMAGES.map((src, i) => (
              <div
                key={i}
                className="intro-img absolute overflow-hidden will-change-transform"
                style={{
                  width: "100%",
                  height: "100%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0,
                }}
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </div>
            ))}

            {/* ── Hero content (nav, heading, social) ── */}
            <div className="hero-content pointer-events-none relative z-10 flex h-full flex-col justify-between p-8 md:p-14">
              {/* Navigation */}
              <nav className="nav flex items-start justify-between">
                <span className="logo font-display text-lg italic uppercase tracking-tight text-white">
                  MARQUE
                </span>
                <div className="nav-items flex gap-10 md:gap-14">
                  <a className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white">
                    Inventory
                  </a>
                  <a className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white">
                    Sell
                  </a>
                  <a className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white">
                    Account
                  </a>
                </div>
              </nav>

              {/* Heading */}
              <div className="hero-header max-w-3xl">
                <h1 className="font-display text-7xl italic uppercase leading-[0.85] tracking-tighter text-white md:text-8xl lg:text-9xl">
                  Precision.
                  <br />
                  Curated.
                </h1>
              </div>

              {/* Social */}
              <div className="hero-social flex items-center gap-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Instagram
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Twitter
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                  YouTube
                </p>
                <a className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent transition-colors hover:text-white">
                  [ Explore ]
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
