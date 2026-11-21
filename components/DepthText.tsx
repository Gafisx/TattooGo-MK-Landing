"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const MAX_LAYERS = 40;
const INTRO_MS = 1200;
const PUSH_STIFFNESS = 260;
const PUSH_DAMPING = 17;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Gera as cores da fumaça baseadas no gradiente principal
const getLayerColor = (index: number, total: number, smokeColor: string) => {
  const progress = total <= 1 ? 1 : index / total;
  const eased = progress * progress;
  // Quanto mais para trás, mais transparente e escuro fica a "fumaça"
  const opacity = (1 - eased) * 0.8;
  return `color-mix(in srgb, ${smokeColor} ${opacity * 100}%, transparent)`;
};

const getTransform = (rotateX: number, rotateY: number, lift = 0, sink = 0) =>
  [
    lift ? `translateY(${lift.toFixed(2)}px)` : "",
    `rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg)`,
    sink ? `translateZ(${(-sink).toFixed(2)}px)` : "",
  ].filter(Boolean).join(" ");

type DepthTextProps = {
  text: string;
  layers?: number;
  depth?: number;
  smokeColor?: string;
  className?: string;
  fontSize?: string;
};

export default function DepthText({
  text,
  layers = 24,
  depth = 2.5,
  smokeColor = "#00FF66",
  className = "",
  fontSize = "clamp(4rem, 10vw, 8rem)",
}: DepthTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: -5, y: 5 });
  const motionRef = useRef({ push: 0, velocity: 0 });
  const introRef = useRef(0);
  const [introDone, setIntroDone] = useState(false);

  const safeLayers = clamp(layers, 2, MAX_LAYERS);
  const safeDepth = clamp(depth, 0, 12);

  // Cria as camadas de "fumaça" atrás do texto
  const depthLayers = useMemo(
    () =>
      Array.from({ length: safeLayers }, (_, layerIndex) => {
        const index = safeLayers - layerIndex;
        return {
          index,
          color: getLayerColor(index, safeLayers, smokeColor),
          transform: `translateZ(calc(var(--depth-grow, 1) * ${(-index * safeDepth).toFixed(2)}px))`,
          blur: Math.round((index / safeLayers) * 12), // Efeito de fumaça (blur aumenta no fundo)
        };
      }),
    [safeLayers, safeDepth, smokeColor]
  );

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setIntroDone(true);
      return;
    }

    let frameId = 0;
    let lastTime = 0;
    const startTime = performance.now();
    const current = rotationRef.current;

    const tick = (now: number) => {
      const delta = lastTime ? Math.min(now - lastTime, 50) : 16;
      lastTime = now;

      if (introRef.current < 1) {
        introRef.current = Math.min(1, introRef.current + delta / INTRO_MS);
        if (introRef.current >= 1) setIntroDone(true);
      }

      // Efeito flutuante (orbit)
      const elapsed = (now - startTime) / 1000;
      const targetX = -5 + Math.sin(elapsed * 0.5) * 5;
      const targetY = 5 + Math.cos(elapsed * 0.5) * 5;

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
    <div ref={rootRef} className={`depth-text ${className}`} style={{ perspective: "1000px" }}>
      <div
        ref={stageRef}
        className="relative inline-grid place-items-center transform-style-preserve-3d"
        style={{ transform: "rotateX(-5deg) rotateY(5deg)", transformStyle: "preserve-3d" }}
      >
        {depthLayers.map((layer) => (
          <span
            key={layer.index}
            aria-hidden="true"
            className="absolute inset-0 font-black tracking-tighter select-none"
            style={{
              color: layer.color,
              transform: layer.transform,
              filter: `blur(${layer.blur}px)`,
              fontSize,
              lineHeight: 0.86,
              backfaceVisibility: "hidden",
            }}
          >
            {text}
          </span>
        ))}
        {/* A face da frente com o gradiente da sua logo */}
        <span
          className="relative z-10 font-black tracking-tighter select-none bg-gradient-to-r from-[#00FF66] via-[#FF9900] to-[#FF6600] bg-clip-text text-transparent"
          style={{ fontSize, lineHeight: 0.86, transform: "translateZ(1px)" }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}