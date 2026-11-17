"use client";

import {
  Children,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type MasterTattooEngineProps = {
  children: ReactNode;
};

type InkParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
  color: string;
};

const MAX_PARTICLES = 96;

export default function MasterTattooEngine({
  children,
}: MasterTattooEngineProps) {
  const engineRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const inkPathRef = useRef<SVGPathElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    const glowPath = glowPathRef.current;
    const inkPath = inkPathRef.current;
    const overlay = overlayRef.current;
    const needle = needleRef.current;
    if (
      !engine ||
      !canvas ||
      !svg ||
      !glowPath ||
      !inkPath ||
      !overlay ||
      !needle
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const particles: InkParticle[] = [];
    let pathLength = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let pixelRatio = 1;
    let needleWidth = 0;
    let needleHeight = 0;
    let progress = 0;
    let scrollVelocity = 0;
    let frameId = 0;
    let lastFrameTime = 0;
    let lastParticleTime = 0;
    const setNeedleX = gsap.quickSetter(needle, "x", "px");
    const setNeedleY = gsap.quickSetter(needle, "y", "px");
    const setNeedleRotation = gsap.quickSetter(needle, "rotation", "deg");

    const scheduleFrame = () => {
      if (frameId || document.hidden) return;
      lastFrameTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const positionNeedle = (time = performance.now()) => {
      if (!pathLength) return;
      const currentLength = Math.max(0, Math.min(pathLength, pathLength * progress));
      const point = inkPath.getPointAtLength(currentLength);
      const before = inkPath.getPointAtLength(Math.max(0, currentLength - 2));
      const after = inkPath.getPointAtLength(
        Math.min(pathLength, currentLength + 2),
      );
      const angle =
        (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;
      const vibration =
        Math.min(1, Math.abs(scrollVelocity) / 1800) *
        Math.sin(time * 0.09) *
        2.4;

      setNeedleX(point.x - needleWidth * 0.68);
      setNeedleY(point.y - needleHeight * 0.56);
      setNeedleRotation(angle + vibration);
    };

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(viewportWidth * pixelRatio);
      canvas.height = Math.round(viewportHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      svg.setAttribute("viewBox", `0 0 ${viewportWidth} ${viewportHeight}`);
      needleWidth = needle.offsetWidth;
      needleHeight = needle.offsetHeight;

      const path = [
        `M ${viewportWidth * 0.76} ${viewportHeight * 0.05}`,
        `C ${viewportWidth * 0.25} ${viewportHeight * 0.14},`,
        `${viewportWidth * 0.86} ${viewportHeight * 0.28},`,
        `${viewportWidth * 0.5} ${viewportHeight * 0.42}`,
        `S ${viewportWidth * 0.12} ${viewportHeight * 0.7},`,
        `${viewportWidth * 0.52} ${viewportHeight * 0.82}`,
        `S ${viewportWidth * 0.9} ${viewportHeight * 0.94},`,
        `${viewportWidth * 0.68} ${viewportHeight * 0.98}`,
      ].join(" ");

      glowPath.setAttribute("d", path);
      inkPath.setAttribute("d", path);
      pathLength = inkPath.getTotalLength();
      [glowPath, inkPath].forEach((pathElement) => {
        pathElement.style.strokeDasharray = `${pathLength}`;
        pathElement.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
      });
      positionNeedle();
    };

    const handleResize = () => {
      resize();
      ScrollTrigger.refresh();
    };

    const emitParticles = (x: number, y: number, speed: number) => {
      const count = Math.min(5, Math.max(1, Math.floor(speed / 900) + 1));
      for (let index = 0; index < count; index += 1) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const color = Math.random() > 0.5 ? "#FF6600" : "#00FF66";
        const angle = Math.random() * Math.PI * 2;
        const impulse = 0.25 + Math.random() * 1.1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * impulse,
          vy: Math.sin(angle) * impulse,
          life: 0.35 + Math.random() * 0.5,
          radius: 0.7 + Math.random() * 1.5,
          color,
        });
      }
      scheduleFrame();
    };

    const updateScrollProgress = (trigger: ScrollTrigger) => {
      progress = trigger.progress;
      scrollVelocity = trigger.getVelocity();
      const dashOffset = pathLength * (1 - progress);
      glowPath.style.strokeDashoffset = `${dashOffset}`;
      inkPath.style.strokeDashoffset = `${dashOffset}`;
      positionNeedle();

      const now = performance.now();
      const speed = Math.abs(scrollVelocity);
      if (speed > 180 && now - lastParticleTime > 24) {
        lastParticleTime = now;
        const point = inkPath.getPointAtLength(pathLength * progress);
        emitParticles(point.x, point.y, speed);
      }
      scheduleFrame();
    };

    function renderFrame(time: number) {
      frameId = 0;
      const frameContext = context;
      if (!frameContext) return;
      const delta = Math.min((time - lastFrameTime) / 16.67, 2);
      lastFrameTime = time;
      frameContext.clearRect(0, 0, viewportWidth, viewportHeight);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= delta / 60;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }

        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        frameContext.globalAlpha = Math.min(1, particle.life) * 0.72;
        frameContext.fillStyle = particle.color;
        frameContext.beginPath();
        frameContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        frameContext.fill();
      }

      frameContext.globalAlpha = 1;
      if (particles.length || Math.abs(scrollVelocity) > 40) {
        scrollVelocity *= Math.pow(0.84, delta);
        positionNeedle(time);
        scheduleFrame();
      } else {
        scrollVelocity = 0;
      }
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function handleVisibilityChange() {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (particles.length || Math.abs(scrollVelocity) > 40) {
        scheduleFrame();
      }
    }

    resize();

    const gsapContext = gsap.context(() => {
      const scenes = engine.querySelectorAll<HTMLElement>("[data-master-scene]");
      scenes.forEach((scene) => {
        const reveal = scene.querySelector<HTMLElement>("[data-master-wipe]");
        if (!reveal) return;
        gsap.set(reveal, {
          scaleY: 1,
          transformOrigin: "top center",
          force3D: true,
          willChange: "transform",
        });
        gsap.to(reveal, {
          scaleY: 0,
          ease: "none",
          scrollTrigger: {
            trigger: scene,
            start: "top bottom",
            end: "top 30%",
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });
      });

      gsap.set(needle, {
        autoAlpha: 1,
        force3D: true,
        transformOrigin: "68% 56%",
        willChange: "transform, opacity",
      });
      gsap.set(overlay, {
        autoAlpha: 1,
        willChange: "opacity",
      });

      ScrollTrigger.create({
        trigger: engine,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: updateScrollProgress,
      });
    }, engine);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      particles.length = 0;
      gsapContext.revert();
    };
  }, []);

  return (
    <div ref={engineRef} className="relative">
      {Children.map(children, (child) => (
        <div data-master-scene className="relative">
          {child}
          <div
            data-master-wipe
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 origin-top bg-[linear-gradient(180deg,rgba(18,18,18,0.98)_0%,rgba(18,18,18,0.9)_72%,rgba(255,102,0,0.16)_94%,rgba(0,255,102,0.42)_100%)] motion-reduce:scale-y-0"
          />
        </div>
      ))}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden opacity-0 motion-reduce:hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
        />
        <svg
          ref={svgRef}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            ref={glowPathRef}
            fill="none"
            stroke="#FF6600"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.16"
            style={{ filter: "blur(9px)" }}
          />
          <path
            ref={inkPathRef}
            fill="none"
            stroke="url(#master-ink-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="master-ink-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FF6600" />
              <stop offset="52%" stopColor="#FF9900" />
              <stop offset="100%" stopColor="#00FF66" />
            </linearGradient>
          </defs>
        </svg>
        <div
          ref={needleRef}
          className="gpu-accelerate absolute left-0 top-0 h-40 w-40 sm:h-52 sm:w-52 lg:h-64 lg:w-64"
        >
          <Image
            src="/assets/images/tattoo-needle-scroll-hero.png"
            alt=""
            fill
            sizes="(max-width: 640px) 160px, (max-width: 1024px) 208px, 256px"
            className="object-contain drop-shadow-[0_0_24px_rgba(255,102,0,0.3)]"
          />
        </div>
      </div>
    </div>
  );
}
