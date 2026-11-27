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
          className={`relative flex-1 min-w-0 overflow-hidden rounded-2xl cursor-pointer transition-colors duration-300 ${
            active === i
              ? "bg-[#0A0713] shadow-[0_0_40px_rgba(255,102,0,0.18)]"
              : "bg-[#0A0713]/85 hover:bg-[#0A0713] hover:shadow-[0_0_24px_rgba(255,102,0,0.10)]"
          }`}
        >
          {/* Aura de marca no item ativo */}
          {active === i && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6600]/12 via-transparent to-[#00FF66]/8 opacity-70" />
          )}
          {/* LED de status do item ativo */}
          {active === i && (
            <div aria-hidden="true" className="pointer-events-none absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-[#FF6600]/30 bg-[#FF6600]/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#FF9900] shadow-[0_0_12px_rgba(255,102,0,0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6600] shadow-[0_0_8px_#FF6600] animate-pulse" />
              Ativo
            </div>
          )}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.label} className={`w-full h-full object-cover transition-all duration-700 ${active === i ? "grayscale-0 scale-105" : "grayscale scale-100 opacity-65"}`} />
            <div className="absolute inset-0 bg-linear-to-t from-[#121212]/95 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
            <span className={`h-6 w-1 rounded-full bg-[#FF6600] transition-all duration-300 ${active === i ? "opacity-100 shadow-[0_0_10px_#FF6600]" : "opacity-0"}`} />
            <span className={`text-xl font-bold transition-all duration-300 ${active === i ? "opacity-100 translate-x-0 text-white" : "opacity-0 -translate-x-4 text-slate-500"}`}>
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
