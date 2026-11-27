"use client";

import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, useMotionTemplate, useReducedMotion } from "motion/react";
import { ArrowUp } from "lucide-react";

const FINGER_MAX = 3000;
const HAND_MAX = 6000;
const CANCEL = 0.5;
const POWER_CAP = 1.5;

type SlingButtonProps = {
  onSend: () => void;
  label?: string;
  size?: number;
  maxPull?: number;
  launchSpeed?: number;
  disabled?: boolean;
};

export default function SlingButton({
  onSend,
  label = "Deslize para começar",
  size = 64,
  maxPull = 160,
  launchSpeed = 2600,
  disabled = false,
}: SlingButtonProps) {
  const reduce = useReducedMotion();
  const R = maxPull;
  const wellR = size / 2 + 4 + 3;
  const H = wellR + 3 + 2;

  const [held, setHeld] = useState(false);
  const [armed, setArmed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);
  const grip = useRef<{ id: number; x: number; y: number; grabX: number; grabY: number; hist: { t: number; vx: number; vy: number }[] } | null>(null);
  const dir = useRef({ ux: 0, uy: -1 });

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const padT = useMotionTemplate`translate(${px}px, ${py}px)`;
  
  const stretch = useTransform([px, py], ([x, y]) => {
    const d = Math.hypot(x as number, y as number);
    return Math.min(d / R, 1);
  });

  const settle = (v0x: number, v0y: number) => {
    if (reduce) {
      px.jump(0); py.jump(0);
      return;
    }
    animate(px, 0, { type: "spring", duration: 0.4, bounce: 0.2, velocity: v0x });
    animate(py, 0, { type: "spring", duration: 0.4, bounce: 0.2, velocity: v0y });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || grip.current || e.button !== 0) return;
    const el = rootRef.current;
    if (!el) return;
    grip.current = { id: e.pointerId, x: e.clientX, y: e.clientY, grabX: 0, grabY: 0, hist: [] };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    setHeld(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    
    const rx = dx;
    const ry = dy;
    
    const raw = Math.hypot(rx, ry);
    if (raw < 0.01) return;
    
    const d = (R * raw) / (R + raw);
    const ux = rx / raw;
    const uy = ry / raw;
    dir.current = { ux, uy };
    
    px.set(d * ux);
    py.set(d * uy);
    
    const t = performance.now();
    g.hist.push({ t, vx: d * ux, vy: d * uy });
    if (g.hist.length > 4 || t - g.hist[0].t > 80) g.hist.shift();
    
    setArmed(d >= 48);
  };

  const release = (e: React.PointerEvent, cancelled: boolean) => {
    const g = grip.current;
    if (!g || g.id !== e.pointerId) return;
    grip.current = null;
    try { padRef.current?.releasePointerCapture(e.pointerId); } catch {}
    
    const d = Math.hypot(px.get(), py.get());
    const p = d / 48;
    const { ux, uy } = dir.current;
    
    let vx = 0; let vy = 0;
    if (!cancelled && g.hist.length > 1) {
      const a = g.hist[0]; const b = g.hist[g.hist.length - 1];
      const dt = b.t - a.t;
      if (dt > 0 && performance.now() - b.t < 50) {
        vx = ((b.vx - a.vx) / dt) * 1000;
        vy = ((b.vy - a.vy) / dt) * 1000;
      }
    }
    
    const fm = Math.hypot(vx, vy);
    if (fm > FINGER_MAX) { vx *= FINGER_MAX / fm; vy *= FINGER_MAX / fm; }

    const fire = armed && !cancelled;
    const launch = fire ? launchSpeed * Math.min(p, POWER_CAP) : CANCEL * launchSpeed * Math.min(p, 1);
    
    let v0x = vx - ux * launch;
    let v0y = vy - uy * launch;
    
    const m = Math.hypot(v0x, v0y);
    if (m > HAND_MAX) { v0x *= HAND_MAX / m; v0y *= HAND_MAX / m; }
    
    if (fire) onSend();
    
    settle(v0x, v0y);
    setHeld(false);
    setArmed(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[240px]" ref={rootRef}>
      <svg className="absolute pointer-events-none overflow-visible" width={H * 2} height={H * 2} viewBox={`${-H} ${-H} ${2 * H} ${2 * H}`}>
        <circle cx={0} cy={0} r={wellR} fill="#1A1A1A" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <motion.circle 
          cx={0} cy={0} r={wellR} fill="none" stroke="#FF6600" strokeWidth={3}
          strokeDasharray="1" pathLength="1"
          style={{ strokeDashoffset: useTransform(stretch, (s) => 1 - s) }}
          opacity={useTransform(stretch, (s) => s > 0.01 ? 1 : 0)}
        />
      </svg>

      <motion.button
        ref={padRef}
        type="button"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => release(e, false)}
        onPointerCancel={(e) => release(e, true)}
        onLostPointerCapture={(e) => release(e, true)}
        // `detail === 0` identifica ativação por teclado/leitor de tela: sem
        // isso o botão só responderia ao gesto de arrasto.
        onClick={(e) => {
          if (e.detail !== 0 || disabled) return;
          onSend();
        }}
        style={{ width: size, height: size, transform: padT }}
        className={`relative z-10 flex items-center justify-center rounded-full bg-[#1A1A1A] border border-white/20 shadow-lg transition-transform ${held ? "cursor-grabbing scale-95" : "cursor-grab hover:scale-105"} ${armed ? "border-[#00FF66]/70 ring-4 ring-[#00FF66]/40 shadow-[0_0_28px_#00FF66]" : "hover:border-white/35"}`}
      >
        <ArrowUp aria-hidden="true" size={size * 0.4} strokeWidth={2.5} />
      </motion.button>
      
      <span className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#FF9900] flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#FF9900] shadow-[0_0_8px_#FF9900] inline-block" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}