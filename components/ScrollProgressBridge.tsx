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
      useScrollStore.getState().setProgress(1);
      invalidate();
      return;
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (trigger) => {
          const progress = Math.min(1, Math.max(0, trigger.progress));
          useScrollStore.getState().setProgress(progress);
          invalidate();
        },
        onRefresh: (trigger) => {
          useScrollStore.getState().setProgress(trigger.progress);
          invalidate();
        },
      },
    });

    // Keeping explicit endpoints makes normalized timelines reach 0 and 1 reliably.
    timeline.set({}, {}, 0);
    timeline.set({}, {}, 1);
    timeline.scrollTrigger?.refresh();

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      useScrollStore.getState().setProgress(0);
    };
  }, [invalidate, reducedMotion]);

  return null;
}
