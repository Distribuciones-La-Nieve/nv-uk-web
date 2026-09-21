"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../lib/cn";

gsap.registerPlugin(ScrollTrigger);

function visibleColumns() {
  if (window.innerWidth >= 1280) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

/** Reveals an ally catalogue in viewport-sized rows. */
export function AlliesLogoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;

    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(
        "[data-ally-card='true']",
        grid
      );

      gsap.set(cards, { autoAlpha: 0, filter: "blur(3px)", y: 18 });

      ScrollTrigger.batch(cards, {
        batchMax: visibleColumns,
        interval: 0.08,
        once: true,
        start: "top 90%",
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            clearProps: "filter,opacity,transform,visibility",
            duration: 0.48,
            ease: "power2.out",
            filter: "blur(0px)",
            stagger: 0.06,
            y: 0,
          });
        },
      });
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={ref} className={cn(className)} data-allies-logo-grid="true">
      {children}
    </div>
  );
}
