"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollStore } from "@/components/scrollProgressStore";

gsap.registerPlugin(ScrollTrigger);

export default function ImmersiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const needleLineRef = useRef<HTMLDivElement>(null);
  
  const setImmersiveProgress = useScrollStore((state) => state.setImmersiveProgress);
  const setImmersiveVisible = useScrollStore((state) => state.setImmersiveVisible);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const needleLine = needleLineRef.current;
    
    if (!section || !svg || !needleLine) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setImmersiveProgress(0);
    setImmersiveVisible(false);

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(svg, { clipPath: "inset(0 0% 0 0)" });
        gsap.set(needleLine, { opacity: 0 });
        return;
      }

      // Esconde o SVG e a linha da agulha no início
      gsap.set(svg, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(needleLine, { left: "0%", opacity: 0 });

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
            // A MÁGICA ACONTECE AQUI: O SVG e a Máquina 3D leem o mesmo progresso (0 a 1)
            setImmersiveProgress(self.progress);
          }
        },
      });

      // O SVG "revela" a tinta
      tl.to(svg, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1,
        ease: "none",
      }, 0);

      // A linha da agulha (DOM) acompanha o movimento
      tl.to(needleLine, {
        left: "100%",
        opacity: 1,
        duration: 1,
        ease: "none",
      }, 0);
      
      // Fade out no final
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
  }, [setImmersiveProgress, setImmersiveVisible]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex h-screen min-h-[600px] flex-col items-center justify-center overflow-hidden bg-[#121212]"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,102,0,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 text-center">
        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#00FF66]">
          A experiência imersiva
        </p>
        
        <div className="relative inline-block w-full max-w-5xl">
          
          {/* Acessibilidade e SEO: O texto real fica escondido para humanos, mas visível para leitores de tela e Google */}
          <h2 className="sr-only">A arte não é opcional.</h2>

          {/* O SVG que a máquina vai tatuar */}
          <svg
            ref={svgRef}
            viewBox="0 0 1000 150"
            className="w-full h-auto overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9900" />
                <stop offset="100%" stopColor="#00FF66" />
              </linearGradient>
            </defs>
            {/* A frase em formato de vetor, centralizada no viewBox */}
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

          {/* Linha da Agulha (DOM) - Representa a máquina no eixo X */}
          <div
            ref={needleLineRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_20px_5px_#00FF66]"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        <p className="mx-auto mt-12 max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] text-white/60">
          Role a página e veja a tinta ganhar vida. A mesma paixão que o tatuador coloca no estúdio, traduzida para a sua tela.
        </p>
      </div>
    </section>
  );
}