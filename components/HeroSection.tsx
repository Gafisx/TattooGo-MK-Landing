"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { Apple, ArrowUpRight, Play, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import TattooInkEngine from "@/components/TattooInkEngine";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const storesRef = useRef<HTMLDivElement>(null);
  const inkStrokeRef = useRef<HTMLDivElement>(null);
  const needleParallaxRef = useRef<HTMLDivElement>(null);
  const needleMotorRef = useRef<HTMLDivElement>(null);
  const needleFloatRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const needleParallax = needleParallaxRef.current;
    const needleMotor = needleMotorRef.current;
    const needleFloat = needleFloatRef.current;
    if (!section || !needleParallax || !needleMotor || !needleFloat) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      if (reduceMotion) return;

      const introTargets = [
        eyebrowRef.current,
        titleRef.current,
        taglineRef.current,
        copyRef.current,
        storesRef.current,
      ].filter((target) => target !== null);

      gsap.set(introTargets, {
        autoAlpha: 0,
        y: 24,
        force3D: true,
        willChange: "transform, opacity",
      });
      gsap.set(inkStrokeRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        force3D: true,
        willChange: "transform",
      });
      gsap.set(needleParallax, {
        force3D: true,
        willChange: "transform",
      });
      gsap.set(needleMotor, {
        force3D: true,
        willChange: "transform",
      });
      gsap.set(needleFloat, {
        force3D: true,
        willChange: "transform",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.55 })
        .to(
          titleRef.current,
          { autoAlpha: 1, y: 0, duration: 0.8 },
          "-=0.28",
        )
        .to(
          inkStrokeRef.current,
          { scaleX: 1, duration: 0.75, ease: "power2.inOut" },
          "-=0.36",
        )
        .to(
          taglineRef.current,
          { autoAlpha: 1, y: 0, duration: 0.55 },
          "-=0.5",
        )
        .to(copyRef.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.38")
        .to(storesRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.35");

      gsap.to(needleFloat, {
        xPercent: 0.7,
        yPercent: -1.1,
        rotate: 0.25,
        scale: 1.005,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });
    }, section);

    if (reduceMotion) {
      return () => context.revert();
    }

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let frameId = 0;
    let lastFrameTime = 0;
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    const setNeedleX = gsap.quickSetter(needleParallax, "x", "px");
    const setNeedleY = gsap.quickSetter(needleParallax, "y", "px");
    const setMotorRotation = gsap.quickSetter(needleMotor, "rotation", "deg");

    const scheduleFrame = () => {
      if (frameId) return;
      lastFrameTime = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      pointer.targetX = (x / bounds.width - 0.5) * 2;
      pointer.targetY = (y / bounds.height - 0.5) * 2;
      scheduleFrame();
    };

    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      scheduleFrame();
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = Math.max(
        -90,
        Math.min(90, currentScrollY - lastScrollY),
      );
      lastScrollY = currentScrollY;
      scheduleFrame();
    };

    const renderFrame = (time: number) => {
      frameId = 0;
      const delta = Math.min((time - lastFrameTime) / 16.67, 2);
      lastFrameTime = time;
      pointer.x += (pointer.targetX - pointer.x) * Math.min(1, 0.1 * delta);
      pointer.y += (pointer.targetY - pointer.y) * Math.min(1, 0.1 * delta);
      setNeedleX(pointer.x * 32);
      setNeedleY(pointer.y * 24);
      scrollVelocity *= Math.pow(0.86, delta);
      const motorShake =
        Math.sin(time * 0.47) * scrollVelocity * 0.004 +
        Math.sin(time * 0.11) * 0.025;
      setMotorRotation(motorShake);

      const pointerIsSettled =
        Math.abs(pointer.targetX - pointer.x) < 0.001 &&
        Math.abs(pointer.targetY - pointer.y) < 0.001;
      if (!pointerIsSettled || Math.abs(scrollVelocity) > 0.05) {
        scheduleFrame();
      }
    };

    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (supportsHover) {
      section.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      section.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (supportsHover) {
        section.removeEventListener("pointermove", handlePointerMove);
        section.removeEventListener("pointerleave", handlePointerLeave);
      }
      window.removeEventListener("scroll", handleScroll);
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="gpu-accelerate relative isolate flex h-screen min-h-[800px] overflow-hidden bg-[#121212]"
      aria-labelledby="hero-title"
    >
      <Image
        src="/assets/images/hero-texture-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="gpu-accelerate object-cover object-[58%_center]"
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.98)_0%,rgba(18,18,18,0.88)_38%,rgba(18,18,18,0.34)_72%,rgba(18,18,18,0.72)_100%),radial-gradient(ellipse_at_76%_44%,rgba(255,102,0,0.2),transparent_28%),radial-gradient(ellipse_at_58%_88%,rgba(0,255,102,0.09),transparent_34%),radial-gradient(ellipse_at_84%_18%,rgba(73,119,255,0.12),transparent_25%),linear-gradient(180deg,rgba(18,18,18,0.18),rgba(18,18,18,0.82)_100%)]" />
      <TattooInkEngine containerRef={sectionRef} />

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:px-16 lg:py-14 2xl:px-20">
        <div className="gpu-accelerate relative z-20 max-w-[720px] pt-10 lg:pt-0">
          <div
            ref={eyebrowRef}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF9900]/25 bg-[#1A1A1A]/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#FF9900] backdrop-blur-md sm:text-xs"
          >
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Tecnologia para quem cria
          </div>

          <h1
            ref={titleRef}
            id="hero-title"
            className="text-[clamp(3.25rem,7.4vw,8.25rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-white"
          >
            <span className="block bg-gradient-to-r from-[#FF6600] via-[#FF9900] to-[#00FF66] bg-clip-text text-transparent [filter:drop-shadow(0_0_26px_rgba(255,102,0,0.2))]">
              TattooGo
            </span>
            <span className="mt-2 block bg-gradient-to-r from-[#FF6600] via-[#FF9900] to-[#00FF66] bg-clip-text text-transparent [filter:drop-shadow(0_0_26px_rgba(255,102,0,0.24))]">
              MK
            </span>
          </h1>

          <div
            ref={inkStrokeRef}
            aria-hidden="true"
            className="gpu-accelerate mt-7 h-[2px] w-[min(42vw,280px)] origin-left rounded-full bg-gradient-to-r from-[#FF6600] via-[#FF9900] to-[#00FF66] shadow-[0_0_18px_rgba(255,102,0,0.65)] sm:mt-8"
          />

          <p
            ref={taglineRef}
            className="mt-6 bg-gradient-to-r from-[#FF9900] via-[#FF6600] to-[#00FF66] bg-clip-text text-[clamp(1.25rem,2.1vw,2rem)] font-semibold tracking-[-0.035em] text-transparent"
          >
            Arte em Movimento
          </p>

          <p
            ref={copyRef}
            className="mt-3 max-w-[590px] text-[clamp(1.05rem,1.45vw,1.35rem)] leading-[1.65] text-white/72 sm:mt-4"
          >
            Uma experiência premium que une artistas, ideias e histórias.
            Descubra talentosos profissionais e agende sua próxima tatuagem
            com confiança, tecnologia e segurança.
          </p>

          <div
            ref={storesRef}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
          >
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-store-button group gpu-accelerate relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-[#1A1A1A]/60 px-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#FF6600]/70 sm:min-w-[218px]"
            >
              <Apple
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[#FF9900]"
              />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-[0.12em] text-white/55">
                  Baixar na
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight">
                  App Store
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 opacity-45 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>

            <a
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-store-button group gpu-accelerate relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/14 bg-[#1A1A1A]/70 px-5 text-white backdrop-blur-xl transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#00FF66]/60 sm:min-w-[218px]"
            >
              <Play
                aria-hidden="true"
                className="h-7 w-7 shrink-0 fill-[#FF6600] text-[#FF6600]"
              />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-[0.12em] text-white/55">
                  Disponível no
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight">
                  Google Play
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 text-[#FF9900] opacity-45 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>

        <div className="gpu-accelerate relative h-[36vh] min-h-[260px] w-full sm:h-[42vh] lg:h-[72vh] lg:min-h-[540px]">
          <div
            ref={needleParallaxRef}
            className="gpu-accelerate absolute inset-[-8%] -left-[18%] sm:left-[-8%] lg:-left-[4%]"
          >
            <div ref={needleMotorRef} className="gpu-accelerate absolute inset-0">
              <div
                ref={needleFloatRef}
                className="gpu-accelerate absolute inset-0"
              >
                <Image
                  src="/assets/images/tattoo-needle-scroll-hero.png"
                  alt="Agulha profissional TattooGo MK criando um traço de tinta"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="gpu-accelerate needle-art object-contain"
                />
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[8%] right-[4%] h-28 w-28 rounded-full bg-[#FF6600]/15 blur-3xl sm:h-44 sm:w-44" />
        </div>
      </div>

      <div className="pointer-events-none absolute right-5 top-6 z-20 flex flex-col items-end gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/55 sm:right-10 sm:top-10 sm:text-[10px]">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
          SYSTEM: 120Hz ACTIVE
        </span>
        <span className="text-[#FF9900]/75">SECURE ENCLAVE</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF6600]/50 to-[#00FF66]/35" />
    </section>
  );
}
