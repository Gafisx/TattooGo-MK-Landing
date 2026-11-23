"use client";

import { useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useMotionTemplate } from "motion/react";

const SLOP = { fine: 4, coarse: 8 };
const TILT_SPRING = { stiffness: 240, damping: 24, mass: 0.6 };
const LIFT_SPRING = { stiffness: 320, damping: 26 };
const FLING = 0.16;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const snap = (deg: number) => Math.round(deg / 180) * 180;

type FlipCardProps = {
  front: React.ReactNode;
  back: React.ReactNode;
  width?: string;
  height?: string;
  className?: string;
  "aria-label"?: string;
};

export default function FlipCard({
  front,
  back,
  width = "100%",
  height = "500px",
  className = "",
  "aria-label": ariaLabel,
}: FlipCardProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const grip = useRef<{ id: number; x: number; y: number; base: number; moved: boolean; slop: number; hist: { t: number; v: number }[] } | null>(null);

  const turn = useMotionValue(0);
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const lift = useSpring(1, LIFT_SPRING);
  const sheen = useSpring(0, LIFT_SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const sumY = useTransform([turn, tiltY], ([t, y]) => (t as number) + (y as number));
  const turnY = useMotionTemplate`perspective(1100px) scale(${lift}) rotateX(${tiltX}deg) rotateY(${sumY}deg)`;
  const gxPct = useMotionTemplate`${gx}%`;
  const gyPct = useMotionTemplate`${gy}%`;

  const settle = (to: number, velocity: number) => {
    if (reduce) turn.jump(to);
    else animate(turn, to, { type: "spring", stiffness: 170, damping: 20, velocity, restDelta: 0.05 });
  };

  const flip = () => {
    const base = snap(turn.get());
    settle(base + 180, 0); // Sempre gira para frente
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || grip.current) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    grip.current = {
      id: e.pointerId, x: e.clientX, y: e.clientY, base: turn.get(), moved: false,
      slop: e.pointerType === "touch" ? SLOP.coarse : SLOP.fine, hist: []
    };
    if (!reduce) lift.set(1.03);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = grip.current;
    if (g && g.id === e.pointerId) {
      const d = e.clientX - g.x;
      if (!g.moved) {
        if (Math.abs(d) < g.slop || reduce) return;
        g.moved = true;
        tiltX.set(0); tiltY.set(0); sheen.set(0);
      }
      const deg = g.base + (d / (rootRef.current?.offsetWidth || 300)) * 180;
      turn.set(deg);
      
      const now = performance.now();
      g.hist.push({ t: now, v: deg });
      if (g.hist.length > 2 && now - g.hist[0].t > 90) g.hist.shift();
      return;
    }

    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width, 0, 1);
    const py = clamp((e.clientY - r.top) / r.height, 0, 1);
    tiltX.set((0.5 - py) * 2 * 12);
    tiltY.set((px - 0.5) * 2 * 12);
    gx.set(px * 100); gy.set(py * 100); sheen.set(1);
  };

  const release = (e: React.PointerEvent, cancelled: boolean) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    grip.current = null;
    try { if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    
    if (e.pointerType === "touch" || !rootRef.current?.matches(":hover")) {
      tiltX.set(0); tiltY.set(0); sheen.set(0); lift.set(1);
    }

    if (!g.moved) {
      if (!cancelled) flip();
      else settle(snap(g.base), 0);
      return;
    }

    const here = turn.get();
    let velocity = 0;
    if (!cancelled && g.hist.length >= 2) {
      const a = g.hist[0], b = g.hist[g.hist.length - 1];
      if (b.t > a.t && performance.now() - b.t < 60) velocity = ((b.v - a.v) / (b.t - a.t)) * 1000;
    }
    
    const to = cancelled ? snap(g.base) : clamp(snap(here + velocity * FLING), snap(here) - 180, snap(here) + 180);
    settle(to, velocity);
  };

  return (
    <div
      ref={rootRef}
      className={`relative cursor-pointer group ${className}`}
      style={{ width, height, perspective: "1200px" }}
      // O cartão é um contêiner interativo nomeado; os botões internos seguem acessíveis.
      role={ariaLabel ? "group" : undefined}
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => release(e, false)}
      onPointerCancel={(e) => release(e, true)}
      onPointerEnter={() => !reduce && lift.set(1.03)}
      onPointerLeave={() => { if (!grip.current) { lift.set(1); tiltX.set(0); tiltY.set(0); sheen.set(0); } }}
    >
      <motion.div className="w-full h-full relative preserve-3d" style={reduce ? undefined : { transform: turnY }}>
        
        {/* FRENTE */}
        <div className="absolute inset-0 backface-hidden overflow-hidden rounded-[2rem] border border-white/20 bg-[#171717]/50 backdrop-blur-xl">
          {front}
          <motion.div 
            className="pointer-events-none absolute inset-0 z-50 mix-blend-overlay"
            style={{ 
              background: useMotionTemplate`radial-gradient(circle at ${gxPct} ${gyPct}, rgba(255,255,255,0.4) 0%, transparent 60%)`,
              opacity: sheen 
            }} 
          />
        </div>

        {/* VERSO */}
        <div className="absolute inset-0 backface-hidden overflow-hidden rounded-[2rem] border border-[#00FF66]/30 bg-[#101713]/90 backdrop-blur-xl" style={{ transform: "rotateY(180deg)" }}>
          {back}
        </div>
      </motion.div>
    </div>
  );
}