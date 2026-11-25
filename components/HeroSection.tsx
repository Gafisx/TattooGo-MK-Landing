"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowRight, MapPin, Palette, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { View } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import DepthText from "./DepthText";
import TattooMachineModel from "./TattooMachineModel";
import StudioLighting from "./StudioLighting";
import { useProceduralAudio } from "@/components/useProceduralAudio";
import type { TrackRef } from "@/lib/refs";

export default function HeroSection() {
  const { playHoverClick } = useProceduralAudio();
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const storesRef = useRef<HTMLDivElement>(null);
  
  // Ref para o View do Drei (o `track` espera RefObject<HTMLElement>)
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = viewRef as TrackRef;
  
  // Hook para verificar se o usuário prefere movimento reduzido
  const reducedMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      if (reducedMotion) return;

      const introTargets = [eyebrowRef.current, taglineRef.current, copyRef.current, storesRef.current].filter(Boolean);

      gsap.set(introTargets, { autoAlpha: 0, y: 24, force3D: true });
      
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.55 })
        .to(taglineRef.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.2")
        .to(copyRef.current, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.38")
        .to(storesRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.35");
    }, section);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-transparent py-20 lg:py-0"
      aria-labelledby="hero-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,102,0,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,255,102,0.1),transparent_50%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-360 items-center gap-12 px-5 sm:px-10 lg:grid-cols-2 lg:gap-8 lg:px-16">
        
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          
          <div
            ref={eyebrowRef}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF9900]/30 bg-[#1A1A1A]/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#FF9900] backdrop-blur-md"
          >
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Para quem vive de arte
          </div>

          <h1 id="hero-title" className="mb-12 flex flex-col items-center lg:items-start">
            <DepthText smokeColor="#00FF66" depth={1.5} className="text-[clamp(3.5rem,7vw,6.5rem)]">
              
              <span className="relative inline-block pr-4 font-(family-name:--font-caveat) font-bold text-[#00FF66] drop-shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                TattooGo
                <svg 
                  viewBox="0 0 100 10" 
                  className="absolute -bottom-3 left-0 h-3 w-full text-[#00FF66] drop-shadow-[0_0_6px_rgba(0,255,102,0.8)]" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M 2 8 Q 50 2 98 8" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    fill="none" 
                    strokeLinecap="round" 
                  />
                </svg>
              </span>

              <span className="font-sans font-black tracking-tight text-[#FF6600] drop-shadow-[0_0_10px_rgba(255,102,0,0.3)]">
                MK
              </span>

            </DepthText>
          </h1>

          <p
            ref={taglineRef}
            className="mt-4 bg-linear-to-r from-[#FF9900] via-[#FF6600] to-[#00FF66] bg-clip-text text-[clamp(1.25rem,2.1vw,2rem)] font-semibold tracking-[-0.035em] text-transparent"
          >
            A arte não é opcional.
          </p>

          <p
            ref={copyRef}
            className="mt-3 max-w-125 text-[clamp(1rem,1.2vw,1.125rem)] leading-[1.65] text-white/70"
          >
            Encontre artistas, compare traços e reserve com clareza. Da primeira
            busca à sessão, a arte continua sendo o centro.
          </p>

          <div ref={storesRef} className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href="#clients-title"
              onMouseEnter={playHoverClick}
              onFocus={playHoverClick}
              className="group relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-[#1A1A1A]/60 px-5 text-[#E0E0E0] shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-[#FF6600]/70 hover:bg-[#1A1A1A] sm:min-w-54.5"
            >
              <MapPin aria-hidden="true" className="h-7 w-7 shrink-0 text-[#FF9900]" />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-normal text-[#E0E0E0]/75">
                  Encontre seu artista
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight text-white">
                  Para clientes
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 opacity-45 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
            </a>

            <a
              href="#artists-title"
              onMouseEnter={playHoverClick}
              onFocus={playHoverClick}
              className="group relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-[#1A1A1A]/60 px-5 text-[#E0E0E0] shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-[#00FF66]/60 hover:bg-[#1A1A1A] sm:min-w-54.5"
            >
              <Palette aria-hidden="true" className="h-7 w-7 shrink-0 text-[#FF6600]" />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-normal text-[#E0E0E0]/75">
                  Mostre seu trabalho
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight text-white">
                  Para tatuadores
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#FF9900] opacity-45 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
            </a>
          </div>
        </div>

        {/* COLUNA DIREITA: Agora abriga o 3D via View */}
        <div 
          ref={viewRef} 
          className="relative hidden h-[50vh] w-full lg:block lg:h-[70vh]" 
          aria-hidden="true"
        >
          {/* O View recorta a cena 3D global para este container exato */}
          <View track={trackRef} className="absolute inset-0">
            <StudioLighting />
            <TattooMachineModel reducedMotion={reducedMotion} mode="hero" />
          </View>

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-50 pointer-events-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">Scroll para revelar</span>
            <ArrowDown aria-hidden="true" className="h-5 w-5 animate-bounce text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}