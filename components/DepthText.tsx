"use client";

import { useEffect, useMemo, useRef } from "react";

const MAX_LAYERS = 20; // Reduzi as camadas para a fumaça ficar mais limpa
const INTRO_MS = 1200;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getTransform = (rotateX: number, rotateY: number, lift = 0, sink = 0) =>
  [
    lift ? `translateY(${lift.toFixed(2)}px)` : "",
    `rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg)`,
    sink ? `translateZ(${(-sink).toFixed(2)}px)` : "",
  ].filter(Boolean).join(" ");

type DepthTextProps = {
  children: React.ReactNode; // <-- MUDOU PARA REACTNODE
  layers?: number;
  depth?: number;
  smokeColor?: string;
  className?: string;
};

export default function DepthText({
  children,
  layers = 16, // Menos camadas, mais nitidez
  depth = 1.5,
  smokeColor = "#00FF66",
  className = "",
}: DepthTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: -5, y: 5 });
  const introRef = useRef(0);

  const safeLayers = clamp(layers, 2, MAX_LAYERS);
  const safeDepth = clamp(depth, 0, 12);

  const depthLayers = useMemo(
    () =>
      Array.from({ length: safeLayers }, (_, layerIndex) => {
        const index = safeLayers - layerIndex;
        return {
          index,
          transform: `translateZ(calc(var(--depth-grow, 1) * ${(-index * safeDepth).toFixed(2)}px))`,
          opacity: (1 - (index / safeLayers)) * 0.4, // Fumaça mais transparente
          blur: Math.round((index / safeLayers) * 6), // Blur bem mais leve
          color: smokeColor,
        };
      }),
    [safeLayers, safeDepth, smokeColor]
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frameId = 0;
    let lastTime = 0;
    const startTime = performance.now();
    const current = rotationRef.current;

    const tick = (now: number) => {
      const delta = lastTime ? Math.min(now - lastTime, 50) : 16;
      lastTime = now;

      if (introRef.current < 1) {
        introRef.current = Math.min(1, introRef.current + delta / INTRO_MS);
      }

      const elapsed = (now - startTime) / 1000;
      const targetX = -5 + Math.sin(elapsed * 0.5) * 3;
      const targetY = 5 + Math.cos(elapsed * 0.5) * 3;

      current.x += (targetX - current.x) * 0.1;
      current.y += (targetY - current.y) * 0.1;

      stage.style.transform = getTransform(current.x, current.y);
      
      const grow = introRef.current >= 1 ? 1 : 1 - Math.pow(1 - introRef.current, 3);
      stage.style.setProperty("--depth-grow", grow.toFixed(4));

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`} style={{ perspective: "1200px" }}>
      <div
        ref={stageRef}
        className="relative inline-grid place-items-center"
        style={{ transform: "rotateX(-5deg) rotateY(5deg)", transformStyle: "preserve-3d" }}
      >
        {depthLayers.map((layer) => (
          <span
            key={layer.index}
            aria-hidden="true"
            className="absolute inset-0 select-none whitespace-nowrap"
            style={{
              color: layer.color,
              transform: layer.transform,
              filter: `blur(${layer.blur}px)`,
              opacity: layer.opacity,
              backfaceVisibility: "hidden",
            }}
          >
            {children}
          </span>
        ))}
        {/* A face da frente (Nítida e Colorida) */}
        <span
          className="relative z-10 select-none whitespace-nowrap"
          style={{ transform: "translateZ(2px)" }}
        >
          {children}
        </span>
      </div>
    </div>
  );
}