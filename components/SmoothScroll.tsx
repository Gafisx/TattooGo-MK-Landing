"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: ReactNode;
};

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = (time: number) => {
      lenisRef.current?.raf(time * 1000);
    };

    const start = () => {
      if (lenisRef.current || mediaQuery.matches) return;
      const lenis = new Lenis({
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
      lenisRef.current = lenis;
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
    };

    const stop = () => {
      gsap.ticker.remove(update);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      ScrollTrigger.refresh();
    };

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) stop();
      else start();
    };

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      const anchor = target.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const element = document.getElementById(id);
      if (!element) return;
      event.preventDefault();
      lenisRef.current?.scrollTo(element, { offset: 0 });
      // Atualiza a URL sem disparar scroll nativo.
      if (window.history && window.history.pushState) {
        window.history.pushState(null, "", href);
      }
    };

    if (!mediaQuery.matches) start();
    mediaQuery.addEventListener("change", handleChange);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      stop();
      mediaQuery.removeEventListener("change", handleChange);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return children;
}