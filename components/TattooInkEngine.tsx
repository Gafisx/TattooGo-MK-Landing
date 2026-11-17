"use client";

import { useEffect, useRef, type RefObject } from "react";

type InkSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  width: number;
  color: string;
};

type InkDroplet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
  color: string;
};

type TattooInkEngineProps = {
  containerRef: RefObject<HTMLElement | null>;
};

const MAX_SEGMENTS = 160;
const MAX_DROPLETS = 56;

export default function TattooInkEngine({
  containerRef,
}: TattooInkEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const drawingContext = canvas.getContext("2d", { alpha: true });
    if (!drawingContext) return;
    const context: CanvasRenderingContext2D = drawingContext;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const segments: InkSegment[] = [];
    const droplets: InkDroplet[] = [];
    const colors = ["#FF6600", "#00FF66", "#FF9900"];
    let width = 0;
    let height = 0;
    let previousPoint: { x: number; y: number } | null = null;
    let lastColorIndex = 0;
    let frameId = 0;
    let lastFrameTime = 0;

    const scheduleFrame = () => {
      if (frameId || document.hidden) return;
      lastFrameTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const resizeCanvas = () => {
      const bounds = container.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const addDroplet = (x: number, y: number, color: string) => {
      if (droplets.length >= MAX_DROPLETS) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.15 + Math.random() * 0.55;
      droplets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.15,
        life: 0.4 + Math.random() * 0.5,
        radius: 0.6 + Math.random() * 1.5,
        color,
      });
    };

    const addInk = (x: number, y: number) => {
      if (!previousPoint) {
        previousPoint = { x, y };
        return;
      }

      const dx = x - previousPoint.x;
      const dy = y - previousPoint.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2) return;

      const steps = Math.min(10, Math.max(1, Math.ceil(distance / 9)));
      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        const nextX = previousPoint.x + dx * progress;
        const nextY = previousPoint.y + dy * progress;
        const color = colors[lastColorIndex % colors.length];
        lastColorIndex += 1;
        const previousProgress = (step - 1) / steps;
        segments.push({
          x1: previousPoint.x + dx * previousProgress,
          y1: previousPoint.y + dy * previousProgress,
          x2: nextX,
          y2: nextY,
          life: 0.9 + Math.random() * 0.45,
          maxLife: 1.35,
          width: 1.2 + Math.random() * 1.8,
          color,
        });
        if (segments.length > MAX_SEGMENTS) segments.shift();
        if (step === steps && Math.random() > 0.45) {
          addDroplet(nextX, nextY, color);
        }
      }
      previousPoint = { x, y };
      scheduleFrame();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      addInk(event.clientX - bounds.left, event.clientY - bounds.top);
    };

    const handlePointerLeave = () => {
      previousPoint = null;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (segments.length || droplets.length) {
        scheduleFrame();
      }
    };

    function renderFrame(time: number) {
      frameId = 0;
      const delta = Math.min((time - lastFrameTime) / 16.67, 2);
      lastFrameTime = time;
      context.clearRect(0, 0, width, height);

      for (let index = segments.length - 1; index >= 0; index -= 1) {
        const segment = segments[index];
        segment.life -= delta / 60;
        if (segment.life <= 0) {
          segments.splice(index, 1);
          continue;
        }

        const fade = Math.min(1, segment.life / segment.maxLife);
        context.globalAlpha = fade * 0.16;
        context.strokeStyle = segment.color;
        context.lineWidth = segment.width * 5;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(segment.x1, segment.y1);
        context.lineTo(segment.x2, segment.y2);
        context.stroke();

        context.globalAlpha = fade * 0.78;
        context.lineWidth = segment.width;
        context.beginPath();
        context.moveTo(segment.x1, segment.y1);
        context.lineTo(segment.x2, segment.y2);
        context.stroke();
      }

      for (let index = droplets.length - 1; index >= 0; index -= 1) {
        const droplet = droplets[index];
        droplet.life -= delta / 60;
        if (droplet.life <= 0) {
          droplets.splice(index, 1);
          continue;
        }

        droplet.x += droplet.vx * delta;
        droplet.y += droplet.vy * delta;
        droplet.vy -= 0.006 * delta;
        context.globalAlpha = Math.min(1, droplet.life) * 0.7;
        context.fillStyle = droplet.color;
        context.beginPath();
        context.arc(droplet.x, droplet.y, droplet.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
      if (segments.length || droplets.length) scheduleFrame();
    }

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    resizeCanvas();
    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      segments.length = 0;
      droplets.length = 0;
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
    />
  );
}
