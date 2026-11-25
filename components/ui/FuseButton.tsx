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

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onBlur={cancelHold}
      whileTap={completed || disabled ? undefined : { scale: 0.985 }}
      aria-pressed={isHolding || completed}
      className={`relative w-full overflow-hidden rounded-xl border px-6 py-4 font-semibold select-none touch-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF66] ${
        completed
          ? "border-[#00FF66]/60 bg-[#00FF66]/15 text-[#00FF66] cursor-default"
          : "border-slate-300/25 bg-slate-800/50 text-white hover:border-[#FF6600]/60 cursor-pointer"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {/* Barra de progresso laranja (ou verde quando concluído) */}
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 ${
          completed
            ? "bg-[#00FF66]/15"
            : "bg-gradient-to-r from-[#FF6600]/35 via-[#FF6600]/45 to-[#FF6600]/60"
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
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-[#FF6600] shadow-[0_0_12px_#FF6600]"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: isHolding ? 0.05 : 0.25,
            ease: isHolding ? "linear" : "easeOut",
          }}
        />
      )}

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
              className="flex items-center gap-2 text-[#00FF66]"
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
              className="flex items-center gap-2"
            >
              <span>{label}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
