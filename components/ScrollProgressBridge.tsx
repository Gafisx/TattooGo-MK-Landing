"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useScrollStore } from "@/components/scrollProgressStore";

gsap.registerPlugin(ScrollTrigger);

type ScrollProgressBridgeProps = {
  reducedMotion: boolean;
};

export default function ScrollProgressBridge({
  reducedMotion,
}: ScrollProgressBridgeProps) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (reducedMotion) {
      invalidate();
      return;
    }

    const scrollProgress = { value: 0 };
    const tween = gsap.to(scrollProgress, {
      value: 1,
      ease: "none",
      onUpdate: () => {
        const progress = Math.min(1, Math.max(0, scrollProgress.value));
        useScrollStore.getState().setProgress(progress);
        invalidate();
      },
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tween.scrollTrigger?.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [invalidate, reducedMotion]);

  return null;
}
