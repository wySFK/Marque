import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface RevealTextProps {
  children: React.ReactNode;
  /** HTML tag to render — default "div" */
  as?: Tag;
  className?: string;
  /** Stagger delay between each line (seconds) */
  stagger?: number;
  /** Initial delay before animation starts (seconds) */
  delay?: number;
  /** Duration of the slide-up per line (seconds) */
  duration?: number;
}

/**
 * Splits text content into individual lines using GSAP SplitText,
 * then reveals each line with a slide-up animation triggered when
 * the element scrolls into view.
 *
 * Uses `mask: "lines"` so each line is clipped to its own bounds
 * (no overflow visible above the line).
 */
export function RevealText({
  children,
  as: Tag = "div",
  className,
  stagger = 0.08,
  delay = 0,
  duration = 1,
}: RevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const splitDone = useRef(false);

  useEffect(() => {
    if (!isInView || !ref.current || splitDone.current) return;

    let killed = false;
    splitDone.current = true;

    (async () => {
      const gsapModule = await import("gsap");
      const { default: SplitText } = await import("gsap/SplitText");

      const gsap = gsapModule.gsap ?? gsapModule.default ?? gsapModule;
      gsap.registerPlugin(SplitText);

      if (killed || !ref.current) return;

      // Split into lines with clip mask (same technique as Preloader)
      new SplitText(ref.current, {
        type: "lines",
        linesClass: "line",
        mask: "lines",
      });

      const lines = ref.current.querySelectorAll<HTMLElement>(".line");
      if (!lines.length) return;

      // Start hidden — slid down below their clip bounds
      gsap.set(lines, { y: "125%" });

      // Animate each line up
      gsap.to(lines, {
        y: "0%",
        duration,
        stagger,
        delay,
        ease: "power3.out",
      });
    })();

    return () => {
      killed = true;
    };
    // NOTE: intentionally only fires once when isInView becomes true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
