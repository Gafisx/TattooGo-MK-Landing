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

type SceneReveal = {
  scene: HTMLElement;
  reveal: HTMLElement;
  top: number;
  height: number;
  setScale: (value: number) => void;
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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const particles: InkParticle[] = [];
    const scenes: SceneReveal[] = Array.from(
      engine.querySelectorAll<HTMLElement>("[data-master-scene]"),
    ).flatMap((scene) => {
      const reveal = scene.querySelector<HTMLElement>("[data-master-wipe]");
      if (!reveal) return [];

      gsap.set(reveal, {
        scaleY: 1,
        transformOrigin: "bottom center",
        force3D: true,
        willChange: "transform",
      });

      return [
        {
          scene,
          reveal,
          top: 0,
          height: 0,
          setScale: (value: number) => gsap.set(reveal, { scaleY: value }),
        },
      ];
    });

    let pathLength = 0;
    let documentHeight = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let pixelRatio = 1;
    let needleWidth = 0;
    let needleHeight = 0;
    let needlePathLength = 0;
    let needlePoint: DOMPoint | null = null;
    let needleAngle = 0;
    let scrollVelocity = 0;
    let frameId = 0;
    let progressFrameId = 0;
    let lastFrameTime = 0;
    let lastParticleTime = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let lastInkPoint: { x: number; y: number } | null = null;
    let pendingTrigger: ScrollTrigger | null = null;
    let globalTrigger: ScrollTrigger | null = null;
    const setNeedleX = gsap.quickSetter(needle, "x", "px");
    const setNeedleY = gsap.quickSetter(needle, "y", "px");
    const setNeedleRotation = gsap.quickSetter(needle, "rotation", "deg");

    const scheduleFrame = () => {
      if (frameId || document.hidden) return;
      lastFrameTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const queueGlobalProgress = (trigger?: ScrollTrigger) => {
      if (trigger) pendingTrigger = trigger;
      if (progressFrameId) return;
      progressFrameId = window.requestAnimationFrame(() => {
        progressFrameId = 0;
        const activeTrigger = pendingTrigger ?? globalTrigger ?? undefined;
        pendingTrigger = null;
        updateGlobalProgress(activeTrigger);
      });
    };

    const updateSceneGeometry = () => {
      const engineTop = engine.getBoundingClientRect().top + window.scrollY;
      scenes.forEach((item) => {
        item.top = engineTop + item.scene.offsetTop;
        item.height = item.scene.offsetHeight;
      });
    };

    const updateSceneReveals = (needleDocumentY: number) => {
      scenes.forEach(({ scene, top, height, setScale }) => {
        const progress =
          height > 0
            ? Math.max(0, Math.min(1, (needleDocumentY - top) / height))
            : 0;
        setScale(1 - progress);
        gsap.set(scene, { opacity: 0.72 + progress * 0.28 });
      });
    };

    const getPathLengthAtY = (targetY: number) => {
      let low = 0;
      let high = pathLength;

      for (let iteration = 0; iteration < 18; iteration += 1) {
        const middle = (low + high) / 2;
        if (inkPath.getPointAtLength(middle).y < targetY) {
          low = middle;
        } else {
          high = middle;
        }
      }

      return (low + high) / 2;
    };

    const updateNeedleTransform = (time = performance.now()) => {
      if (!needlePoint) return;
      const vibration = reducedMotion
        ? 0
        : 0.28 + Math.min(0.72, Math.abs(scrollVelocity) / 2500);
      const vibrationX = vibration * Math.sin(time * 0.31) * 1.4;
      const vibrationY = vibration * Math.sin(time * 0.43) * 1.1;
      const motorRotation = reducedMotion ? 0 : Math.sin(time * 0.19) * 0.7;

      setNeedleX(needlePoint.x - needleWidth * 0.68 + vibrationX);
      setNeedleY(
        needlePoint.y - window.scrollY - needleHeight * 0.56 + vibrationY,
      );
      setNeedleRotation(needleAngle + motorRotation);
    };

    const updateGlobalProgress = (trigger?: ScrollTrigger) => {
      if (!pathLength || !documentHeight) return;

      const now = performance.now();
      const scrollY = window.scrollY;
      const elapsed = Math.max(1, now - lastScrollTime);
      const measuredVelocity = ((scrollY - lastScrollY) / elapsed) * 1000;
      const triggerVelocity = trigger?.getVelocity() ?? 0;
      scrollVelocity =
        Math.abs(triggerVelocity) > Math.abs(measuredVelocity)
          ? triggerVelocity
          : measuredVelocity;
      lastScrollY = scrollY;
      lastScrollTime = now;
      const maxScroll = Math.max(1, ScrollTrigger.maxScroll(window));
      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      const verticalInset = viewportHeight * 0.12;
      const needleDocumentY = Math.max(
        verticalInset,
        Math.min(
          documentHeight - verticalInset,
          verticalInset + progress * (documentHeight - verticalInset * 2),
        ),
      );
      needlePathLength = getPathLengthAtY(needleDocumentY);
      needlePoint = inkPath.getPointAtLength(needlePathLength);
      const before = inkPath.getPointAtLength(
        Math.max(0, needlePathLength - 2),
      );
      const after = inkPath.getPointAtLength(
        Math.min(pathLength, needlePathLength + 2),
      );
      needleAngle =
        (Math.atan2(after.y - before.y, after.x - before.x) * 180) / Math.PI;

      svg.setAttribute(
        "viewBox",
        `0 ${scrollY} ${viewportWidth} ${viewportHeight}`,
      );
      const dashOffset = pathLength - needlePathLength;
      glowPath.style.strokeDashoffset = `${dashOffset}`;
      inkPath.style.strokeDashoffset = `${dashOffset}`;
      updateSceneReveals(needleDocumentY);
      updateNeedleTransform();

      const speed = Math.abs(scrollVelocity);
      if (!reducedMotion && speed > 180 && now - lastParticleTime > 24) {
        lastParticleTime = now;
        emitParticles(
          needlePoint.x,
          needlePoint.y - scrollY,
          speed,
        );
      }
      drawInkTrail(needlePoint.x, needlePoint.y - scrollY);
      scheduleFrame();
    };

    const buildGlobalPath = () => {
      documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        engine.scrollHeight,
        viewportHeight,
      );

      const amplitude = Math.min(viewportWidth * 0.29, 240);
      const cycles = Math.max(
        2,
        Math.ceil(documentHeight / Math.max(1, viewportHeight * 1.75)),
      );
      const xAt = (y: number) =>
        viewportWidth / 2 +
        amplitude *
          Math.sin((y / documentHeight) * Math.PI * 2 * cycles + Math.PI / 2);
      const step = Math.max(180, viewportHeight * 0.72);
      let path = `M ${xAt(0)} 0`;

      for (let startY = 0; startY < documentHeight; ) {
        const endY = Math.min(documentHeight, startY + step);
        const firstControlY = startY + (endY - startY) / 3;
        const secondControlY = startY + ((endY - startY) * 2) / 3;
        path +=
          ` C ${xAt(firstControlY)} ${firstControlY},` +
          ` ${xAt(secondControlY)} ${secondControlY},` +
          ` ${xAt(endY)} ${endY}`;
        startY = endY;
      }

      glowPath.setAttribute("d", path);
      inkPath.setAttribute("d", path);
      pathLength = inkPath.getTotalLength();
      [glowPath, inkPath].forEach((pathElement) => {
        pathElement.style.strokeDasharray = `${pathLength}`;
        pathElement.style.strokeDashoffset = `${pathLength}`;
      });
    };

    const resizeCanvas = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(viewportWidth * pixelRatio);
      canvas.height = Math.round(viewportHeight * pixelRatio);
      canvas.style.height = `${viewportHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, viewportWidth, viewportHeight);
      lastInkPoint = null;
    };

    const resize = () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      needleWidth = needle.offsetWidth;
      needleHeight = needle.offsetHeight;
      updateSceneGeometry();
      buildGlobalPath();
      resizeCanvas();
      updateGlobalProgress();
    };

    const handleRefresh = () => {
      updateSceneGeometry();
      buildGlobalPath();
      resizeCanvas();
      updateGlobalProgress(globalTrigger ?? undefined);
    };

    const handleResize = () => {
      resize();
      ScrollTrigger.refresh();
    };

    const handleScroll = () => queueGlobalProgress(globalTrigger ?? undefined);

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

    const drawInkTrail = (x: number, y: number) => {
      context.save();
      context.globalCompositeOperation = "destination-out";
      context.globalAlpha = 0.018;
      context.fillRect(0, 0, viewportWidth, viewportHeight);
      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 0.9;

      if (lastInkPoint) {
        const gradient = context.createLinearGradient(
          lastInkPoint.x,
          lastInkPoint.y,
          x,
          y,
        );
        gradient.addColorStop(0, "#FF6600");
        gradient.addColorStop(0.52, "#FF9900");
        gradient.addColorStop(1, "#00FF66");

        context.beginPath();
        context.moveTo(lastInkPoint.x, lastInkPoint.y);
        context.lineTo(x, y);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = gradient;
        context.lineWidth = 2.8;
        context.shadowColor = "#FF6600";
        context.shadowBlur = 12;
        context.stroke();
      } else {
        context.beginPath();
        context.arc(x, y, 2, 0, Math.PI * 2);
        context.fillStyle = "#FF9900";
        context.shadowColor = "#FF6600";
        context.shadowBlur = 12;
        context.fill();
      }

      context.restore();
      lastInkPoint = { x, y };
    };

    function renderFrame(time: number) {
      frameId = 0;
      const frameContext = context;
      if (!frameContext) return;
      const delta = Math.min((time - lastFrameTime) / 16.67, 2);
      lastFrameTime = time;
      frameContext.save();
      frameContext.globalCompositeOperation = "destination-out";
      frameContext.globalAlpha = 0.008;
      frameContext.fillRect(0, 0, viewportWidth, viewportHeight);
      frameContext.restore();

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        frameContext.clearRect(
          particle.x - particle.radius - 2,
          particle.y - particle.radius - 2,
          (particle.radius + 2) * 2,
          (particle.radius + 2) * 2,
        );
      }

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
      if (!reducedMotion || particles.length || Math.abs(scrollVelocity) > 40) {
        if (Math.abs(scrollVelocity) > 40) {
          scrollVelocity *= Math.pow(0.84, delta);
        } else {
          scrollVelocity = 0;
        }
        updateNeedleTransform(time);
        scheduleFrame();
      } else {
        scrollVelocity = 0;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (
        !reducedMotion ||
        particles.length ||
        Math.abs(scrollVelocity) > 40
      ) {
        scheduleFrame();
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    ScrollTrigger.addEventListener("refresh", handleRefresh);

    resize();

    const gsapContext = gsap.context(() => {
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

      globalTrigger = ScrollTrigger.create({
        trigger: engine,
        start: "top top",
        end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
        invalidateOnRefresh: true,
        onUpdate: queueGlobalProgress,
        onRefresh: updateGlobalProgress,
      });
      ScrollTrigger.refresh();
    }, engine);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(progressFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      ScrollTrigger.removeEventListener("refresh", handleRefresh);
      particles.length = 0;
      globalTrigger = null;
      gsapContext.revert();
    };
  }, []);

  return (
    <div ref={engineRef} className="relative">
      {Children.map(children, (child) => (
        <div data-master-scene className="relative">
          {child}
        </div>
      ))}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden opacity-0"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 h-full w-full"
        />
        <svg
          ref={svgRef}
          className="pointer-events-none fixed inset-0 z-40 h-full w-full"
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
          className="gpu-accelerate pointer-events-none fixed left-0 top-0 z-50 h-40 w-40 sm:h-52 sm:w-52 lg:h-64 lg:w-64"
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
