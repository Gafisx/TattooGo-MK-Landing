"use client";

import { Lock, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type SecurityShieldProps = {
  variant?: "client" | "artist";
};

const VARIANT_STYLES = {
  client: {
    aura: "from-[#FF6600]/30 via-[#FF9900]/15 to-[#00FF66]/20",
    glowTop: "bg-[#FF6600]/20",
    glowBottom: "bg-[#FF9900]/15",
    iconColor: "text-[#FF9900]",
    badgeText: "text-[#FF9900]",
    dot: "bg-[#FF6600] shadow-[0_0_8px_#FF6600]",
    ringBorder: "border-[#FF9900]/30",
  },
  artist: {
    aura: "from-[#00FF66]/25 via-[#00FF66]/10 to-[#FF6600]/20",
    glowTop: "bg-[#00FF66]/18",
    glowBottom: "bg-[#4977FF]/15",
    iconColor: "text-[#00FF66]",
    badgeText: "text-[#00FF66]",
    dot: "bg-[#00FF66] shadow-[0_0_8px_#00FF66]",
    ringBorder: "border-[#00FF66]/30",
  },
} as const;

/**
 * Interactive titanium glass shield displaying the platform's data and art protection layers.
 */
export default function SecurityShield({ variant = "client" }: SecurityShieldProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px] [perspective:1200px]">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-[6%] rounded-[2.5rem] bg-linear-to-br ${styles.aura} opacity-70 blur-[70px]`}
      />

      <motion.div
        whileHover={reducedMotion ? undefined : { rotateX: 3, rotateY: -4, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-900/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none -top-16 -left-16 absolute h-56 w-56 rounded-full ${styles.glowTop} blur-3xl`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none -right-14 -bottom-16 absolute h-56 w-56 rounded-full ${styles.glowBottom} blur-3xl`}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-[2rem] border border-white/15 bg-linear-to-br from-white/[0.07] via-transparent to-white/[0.02]"
        />

        {/* Top status badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#121212]/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200 backdrop-blur-md">
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            AES-256 · OTP · LGPD
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-[#121212]/70 text-slate-200 backdrop-blur-md">
            <Lock aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>

        {/* Central glass shield emblem */}
        <div
          role="img"
          aria-label="Escudo de vidro TattooGo MK representando blindagem de dados e arte com AES-256, OTP e LGPD"
          className="relative z-10 flex h-[calc(100%-6.5rem)] items-center justify-center"
        >
          <div
            className={`relative flex h-44 w-44 items-center justify-center rounded-full border ${styles.ringBorder} bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] backdrop-blur-xl sm:h-52 sm:w-52`}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-full border border-white/10"
            />
            <ShieldCheck
              aria-hidden="true"
              className={`h-24 w-24 ${styles.iconColor} drop-shadow-[0_0_28px_rgba(255,153,0,0.28)] sm:h-28 sm:w-28`}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Bottom glass telemetry bar */}
        <div className="relative z-10 flex items-center justify-between rounded-xl border border-white/15 bg-[#121212]/70 px-4 py-2.5 font-mono text-[11px] text-slate-300 backdrop-blur-md">
          <span>Blindagem Ativa</span>
          <span className={`font-semibold uppercase tracking-wider ${styles.badgeText}`}>
            PWA Seguro
          </span>
        </div>
      </motion.div>
    </div>
  );
}
