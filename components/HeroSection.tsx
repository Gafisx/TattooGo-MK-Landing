"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Palette,
  ShieldCheck,
} from "lucide-react";
import gsap from "gsap";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const storesRef = useRef<HTMLDivElement>(null);
  const inkStrokeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

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
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="gpu-accelerate relative isolate flex h-screen min-h-[800px] overflow-hidden bg-[#121212]/20"
      aria-labelledby="hero-title"
    >
      <Image
        src="/assets/images/hero-texture-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="gpu-accelerate object-cover object-[58%_center] opacity-[0.08]"
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.98)_0%,rgba(18,18,18,0.88)_38%,rgba(18,18,18,0.06)_72%,rgba(18,18,18,0.16)_100%),radial-gradient(ellipse_at_76%_44%,rgba(255,102,0,0.2),transparent_28%),radial-gradient(ellipse_at_58%_88%,rgba(0,255,102,0.09),transparent_34%),radial-gradient(ellipse_at_84%_18%,rgba(73,119,255,0.12),transparent_25%),linear-gradient(180deg,rgba(18,18,18,0.08),rgba(18,18,18,0.28)_100%)]" />

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
              href="#clients-title"
              className="hero-store-button group gpu-accelerate relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-[#1A1A1A]/60 px-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#FF6600]/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900] motion-reduce:transition-none sm:min-w-[218px]"
            >
              <MapPin
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[#FF9900]"
              />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-[0.12em] text-white/55">
                  Descubra a jornada
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight">
                  Para clientes
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 opacity-45 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>

            <a
              href="#artists-title"
              className="hero-store-button group gpu-accelerate relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/14 bg-[#1A1A1A]/70 px-5 text-white backdrop-blur-xl transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[#00FF66]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF66] motion-reduce:transition-none sm:min-w-[218px]"
            >
              <Palette
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[#FF6600]"
              />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-[0.12em] text-white/55">
                  Conheça a jornada
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight">
                  Para tatuadores
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 text-[#FF9900] opacity-45 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>

        <div className="gpu-accelerate relative h-[22vh] min-h-[180px] w-full sm:h-[32vh] sm:min-h-[220px] lg:h-[72vh] lg:min-h-[540px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-end justify-center p-4"
          >
            <span className="rounded-full border border-white/15 bg-[#121212]/70 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
              Role a página para revelar a tatuagem
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-[8%] right-[4%] h-28 w-28 rounded-full bg-[#FF6600]/15 blur-3xl sm:h-44 sm:w-44" />
        </div>
      </div>

      <div className="pointer-events-none absolute right-5 top-6 z-20 flex flex-col items-end gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/55 sm:right-10 sm:top-10 sm:text-[10px]">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]" />
          SCROLL: 3D ACTIVE
        </span>
        <span className="text-[#FF9900]/75">SCROLL TO REVEAL</span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF6600]/50 to-[#00FF66]/35" />
    </section>
  );
}
