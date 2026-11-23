"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { View } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useScrollStore } from "@/components/scrollProgressStore";
import TattooMachineModel from "./TattooMachineModel";
import StudioLighting from "./StudioLighting";
import type { TrackRef } from "@/lib/refs";

gsap.registerPlugin(ScrollTrigger);

export default function ImmersiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const needleLineRef = useRef<HTMLDivElement>(null);
  
  // Ref para o View do Drei (ancorar a máquina 3D ao texto; `track` espera RefObject<HTMLElement>)
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = viewRef as TrackRef;
  const reducedMotion = useReducedMotion() ?? false;
  
  const setImmersiveProgress = useScrollStore((state) => state.setImmersiveProgress);
  const setImmersiveVisible = useScrollStore((state) => state.setImmersiveVisible);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const needleLine = needleLineRef.current;
    
    if (!section || !svg || !needleLine) return;

    setImmersiveProgress(0);
    setImmersiveVisible(false);

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(svg, { clipPath: "inset(0 0% 0 0)" });
        gsap.set(needleLine, { opacity: 0 });
        return;
      }

      // Esconde o SVG e a linha da agulha no início
      gsap.set(svg, { clipPath: "inset(0 100% 0 0)" });
      // Usamos xPercent (-100%) para posicionar a linha no início sem usar a propriedade left
      gsap.set(needleLine, { xPercent: 0, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%", 
          pin: true,     
          scrub: 1,      
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => setImmersiveVisible(true),
          onLeave: () => setImmersiveVisible(false),
          onEnterBack: () => setImmersiveVisible(true),
          onLeaveBack: () => setImmersiveVisible(false),
          onUpdate: (self) => {
            // O Zustand sincroniza a Máquina 3D
            setImmersiveProgress(self.progress);
          }
        },
      });

      // Revela o texto do SVG (Tatuagem acontecendo)
      tl.to(svg, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1,
        ease: "none",
      }, 0);

      // Move a linha da agulha usando translateX (GPU accelerated)
      // xPercent vai de 0% até o tamanho total do container
      tl.to(needleLine, {
        xPercent: 100,
        opacity: 1,
        duration: 1,
        ease: "none",
      }, 0);
      
      // Fade out na linha no final
      tl.to(needleLine, {
        opacity: 0,
        duration: 0.1,
        ease: "none",
      }, 0.9);

    }, section);

    return () => {
      context.revert();
      setImmersiveVisible(false);
    };
  }, [setImmersiveProgress, setImmersiveVisible, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex h-screen min-h-[600px] flex-col items-center justify-center overflow-hidden bg-transparent"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,102,0,0.05),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 text-center">
        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#00FF66]">
          A experiência imersiva
        </p>
        
        {/* CONTAINER ONDE A MÁQUINA 3D VAI VIVER */}
        <div ref={viewRef} className="relative inline-block w-full">
          
          {/* O View recorta a máquina e as luzes para existirem APENAS dentro deste container */}
          <View track={trackRef} className="absolute inset-0 z-0 pointer-events-none">
            <StudioLighting />
            <TattooMachineModel reducedMotion={reducedMotion} />
          </View>

          {/* O texto real escondido para leitores de tela e Google (SEO) */}
          <h2 className="sr-only">A arte não é opcional.</h2>

          {/* O SVG que será preenchido pela agulha */}
          <svg
            ref={svgRef}
            viewBox="0 0 1000 150"
            className="relative z-10 w-full h-auto overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9900" />
                <stop offset="100%" stopColor="#00FF66" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="url(#inkGradient)"
              className="font-sans font-black tracking-tighter"
              style={{ fontSize: "90px" }}
            >
              A ARTE NÃO É OPCIONAL.
            </text>
          </svg>

          {/* A Linha de Luz da Agulha (Agora com translateX em vez de left) */}
          <div
            ref={needleLineRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-0 z-20 flex w-0.5 -translate-x-1/2 items-center justify-center"
          >
            {/* Núcleo branco */}
            <div className="h-full w-[2px] bg-white" />
            {/* Aura Verde Neon (Desfocada) */}
            <div className="absolute inset-y-0 w-6 bg-[#00FF66]/50 blur-md" />
            <div className="absolute inset-y-0 w-2 bg-[#00FF66] blur-sm" />
          </div>
        </div>

        <p className="relative z-10 mx-auto mt-12 max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] text-white/60">
          Role a página e veja a tinta ganhar vida. A mesma paixão que o tatuador coloca no estúdio, traduzida para a sua tela.
        </p>
      </div>
    </section>
  );
}