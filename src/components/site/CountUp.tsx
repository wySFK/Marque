import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useInView } from "framer-motion";

interface CountUpProps {
  /** The target numeric value to count up to */
  value: number;
  /** Text appended after the number (e.g. "+", "/10") */
  suffix?: string;
  /** Text prepended before the number (e.g. "$") */
  prefix?: string;
  /** Number of decimal places to display */
  decimals?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Optional className for styling */
  className?: string;
}

/**
 * Animates a number from 0 → value when scrolled into view.
 * Uses framer-motion's animate() with the same editorial cubic-bezier
 * used across the site ([0.19, 1, 0.22, 1]).
 */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(prefix + (0).toFixed(decimals) + suffix);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.19, 1, 0.22, 1],
      onUpdate: (latest) => {
        setDisplay(prefix + latest.toFixed(decimals) + suffix);
      },
    });

    return () => controls.stop();
  }, [isInView, value, prefix, suffix, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
