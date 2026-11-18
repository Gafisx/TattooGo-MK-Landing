"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis || mediaQuery.matches) return;
      lenis = new Lenis({
        autoRaf: false,
        autoResize: true,
        lerp: 0.075,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.1,
        touchMultiplier: 1.15,
        wheelMultiplier: 1,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
    };

    const stop = () => {
      gsap.ticker.remove(update);
      lenis?.destroy();
      lenis = null;
      ScrollTrigger.refresh();
    };

    const update = (time: number) => {
      lenis?.raf(time * 1000);
    };

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) stop();
      else start();
    };

    if (!mediaQuery.matches) start();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      stop();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return children;
}
