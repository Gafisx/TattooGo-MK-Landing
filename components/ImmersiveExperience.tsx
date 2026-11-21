"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollStore } from "@/components/scrollProgressStore";

gsap.registerPlugin(ScrollTrigger);

export default function ImmersiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const needleLineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  
  // Acessando as actions do Zustand
  const { setImmersiveProgress, setImmersiveVisible } = useScrollStore();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const needleLine = needleLineRef.current;
    const glow = glowRef.current;
    
    if (!section || !text || !needleLine || !glow) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Limpa o estado ao montar/desmontar para evitar bugs
    setImmersiveProgress(0);
    setImmersiveVisible(false);

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(text, { clipPath: "inset(0 0% 0 0)" });
        gsap.set(needleLine, { opacity: 0 });
        gsap.set(glow, { opacity: 1 });
        return;
      }

      // Configura o texto para começar totalmente escondido e a linha no início
      gsap.set(text, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(needleLine, { left: "0%", opacity: 0 });
      gsap.set(glow, { opacity: 0, left: "0%" });

      // Cria a timeline que será controlada pelo Scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%", // A animação dura 1.5x o tamanho da tela
          pin: true,     // Fixa a tela enquanto a máquina "tatura"
          scrub: 1,      // Suaviza o movimento do scroll
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => setImmersiveVisible(true),
          onLeave: () => setImmersiveVisible(false),
          onEnterBack: () => setImmersiveVisible(true),
          onLeaveBack: () => setImmersiveVisible(false),
          onUpdate: (self) => {
            // Atualiza o Zustand para a máquina 3D ler
            setImmersiveProgress(self.progress);
          }
        },
      });

      // Revela o texto preenchendo da esquerda para a direita
      tl.to(text, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1,
        ease: "none",
      }, 0);

      // Move a "agulha" (a linha de luz no DOM) junto com a revelação
      tl.to(needleLine, {
        left: "100%",
        opacity: 1,
        duration: 1,
        ease: "none",
      }, 0);
      
      // Move o brilho (glow) junto
      tl.to(glow, {
        left: "100%",
        opacity: 1,
        duration: 1,
        ease: "none",
      }, 0);
      
      // Um pequeno fade no brilho no final para não ficar preso na borda
      tl.to([needleLine, glow], {
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
      {/* Fundo sutil para dar contraste ao texto e à máquina */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,102,0,0.08),transparent_50%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 text-center">
        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#00FF66]">
          A experiência imersiva
        </p>
        
        <div className="relative inline-block w-full">
          {/* O Texto que será "tatuado" */}
          <h2
            ref={textRef}
            className="mx-auto max-w-5xl text-[clamp(2.5rem,6vw,6.5rem)] font-black uppercase leading-[1.1] tracking-tighter text-white"
            style={{
              fontFamily: "var(--font-geist-sans), sans-serif",
              backgroundImage: "linear-gradient(90deg, #FF9900, #00FF66)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            A arte não é opcional.
          </h2>

          {/* A LINHA DA AGULHA (DOM) - Fica invisível mas sincronizada */}
          <div
            ref={needleLineRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_20px_5px_#00FF66]"
            style={{ mixBlendMode: "screen" }}
          />

          {/* O BRILHO (GLOW) AO REDOR DA AGULHA */}
          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-8 -translate-x-1/2 rounded-full bg-[#00FF66]/30 blur-xl"
          />
        </div>

        <p className="mx-auto mt-12 max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] text-white/60">
          Role a página e veja a tinta ganhar vida. A mesma paixão que o tatuador coloca no estúdio, traduzida para a sua tela.
        </p>
      </div>
    </section>
  );
}