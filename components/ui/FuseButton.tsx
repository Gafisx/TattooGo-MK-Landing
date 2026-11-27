"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

export interface FuseButtonProps {
  label: string;
  completedLabel?: string;
  durationMs?: number;
  onComplete?: () => void;
  disabled?: boolean;
  className?: string;
}

const TICK_MS = 25;

export default function FuseButton({
  label,
  completedLabel = "Concluído",
  durationMs = 2000,
  onComplete,
  disabled = false,
  className = "",
}: FuseButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const startHold = () => {
    if (disabled || completed || isHoldingRef.current) return;

    clearTimers();
    isHoldingRef.current = true;
    setIsHolding(true);
    setProgress(0);

    const step = (100 * TICK_MS) / durationMs;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + step));
    }, TICK_MS);

    timeoutRef.current = setTimeout(() => {
      clearTimers();
      isHoldingRef.current = false;
      setIsHolding(false);
      setProgress(100);
      setCompleted(true);
      onComplete?.();
    }, durationMs);
  };

  const cancelHold = () => {
    clearTimers();
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    setIsHolding(false);
    if (!completed) {
      setProgress(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      if (e.repeat) return;
      e.preventDefault();
      startHold();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      cancelHold();
    }
  };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={cancelHold}
      whileTap={completed || disabled ? undefined : { scale: 0.985 }}
      aria-pressed={isHolding || completed}
      className={`relative w-full overflow-hidden rounded-xl border px-6 py-4 font-semibold select-none touch-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF66] ${
        completed
          ? "border-[#00FF66]/70 bg-[#00FF66]/18 text-[#00FF66] cursor-default shadow-[0_0_22px_rgba(0,255,102,0.22)]"
          : "border-slate-300/30 bg-slate-800/55 text-white hover:border-[#FF6600]/70 hover:bg-slate-700/55 hover:shadow-[0_0_22px_rgba(255,102,0,0.18)] cursor-pointer"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 ${
          completed
            ? "bg-[#00FF66]/20 shadow-[0_0_14px_rgba(0,255,102,0.25)]"
            : "bg-gradient-to-r from-[#FF6600]/35 via-[#FF6600]/50 to-[#FF6600]/70 shadow-[0_0_10px_rgba(255,102,0,0.2)]"
        }`}
        initial={{ width: "0%" }}
        animate={{ width: completed ? "100%" : `${progress}%` }}
        transition={{
          duration: isHolding ? 0.05 : 0.25,
          ease: isHolding ? "linear" : "easeOut",
        }}
      />

      {/* Filete inferior de alta precisão do fusível */}
      {!completed && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-[#FF6600] shadow-[0_0_14px_#FF6600]"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: isHolding ? 0.05 : 0.25,
            ease: isHolding ? "linear" : "easeOut",
          }}
        />
      )}

      {/* Indicador luminoso superior do fusível */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 right-0 h-0.5 w-1 rounded-full ${
          completed
            ? "bg-[#00FF66] shadow-[0_0_10px_#00FF66]"
            : "bg-[#FF9900] shadow-[0_0_10px_#FF9900] group-hover/btn:bg-[#FF6600] group-hover/btn:shadow-[0_0_10px_#FF6600]"
        }`}
      />

      {/* Conteúdo do botão */}
      <span className="relative z-10 flex items-center justify-center gap-2.5 text-sm sm:text-base">
        <AnimatePresence mode="wait" initial={false}>
          {completed ? (
            <motion.span
              key="completed"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="flex items-center gap-2 text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]"
            >
              <Check className="h-5 w-5 stroke-[2.5]" />
              <span>{completedLabel}</span>
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex items-center gap-2"
            >
              <span>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
