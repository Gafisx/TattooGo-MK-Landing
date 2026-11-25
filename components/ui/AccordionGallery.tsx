"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";

type Item = {
  image: string;
  label: string;
  link?: string;
};

export default function AccordionGallery({ items }: { items: Item[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const count = items.length;
      const r = 0.52;
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const rot = isActive ? 0 : i < active ? 8 : -8;

        gsap.to(panel, {
          flexGrow: isActive ? grow : 1,
          rotateY: rot,
          duration: animate ? 0.6 : 0,
          ease: "power3.out",
        });
      });
    },
    [active, items.length]
  );

  useEffect(() => {
    applyLayout(true);
  }, [applyLayout]);

  return (
    <div ref={rootRef} className="flex flex-row gap-2 w-full max-w-[1440px] mx-auto h-[460px] [perspective:1400px]">
      {items.map((item, i) => (
        <div
          key={item.label}
          ref={(el) => { panelRefs.current[i] = el; }}
          onMouseEnter={() => setActive(i)}
          className="relative flex-1 min-w-0 overflow-hidden rounded-2xl cursor-pointer bg-[#0A0713]"
        >
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.label} className={`w-full h-full object-cover transition-all duration-700 ${active === i ? "grayscale-0 scale-105" : "grayscale scale-100 opacity-60"}`} />
            <div className="absolute inset-0 bg-linear-to-t from-[#121212] via-transparent to-transparent opacity-80" />
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
            <span className={`h-6 w-1 rounded-full bg-[#FF6600] transition-all ${active === i ? "opacity-100" : "opacity-0"}`} />
            <span className={`text-xl font-bold text-white transition-all ${active === i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
