"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ImmersiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    const glow = glowRef.current;
    if (!section || !text || !glow) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(text, { clipPath: "inset(0 0 0 0)" });
        gsap.set(glow, { opacity: 1 });
        return;
      }

      // Configura o texto para começar "escondido"
      gsap.set(text, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(glow, { opacity: 0, left: "0%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%", // A animação dura 1.5x o tamanho da tela
          pin: true,     // Fixa a tela enquanto a máquina "tatura"
          scrub: 1,      // Suaviza o movimento do scroll
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Revela o texto preenchendo da esquerda para a direita
      tl.to(text, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1,
        ease: "none",
      }, 0);

      // Move a "agulha" (o brilho) junto com a revelação
      tl.to(glow, {
        left: "100%",
        opacity: 1,
        duration: 1,
        ease: "none",
      }, 0);
      
      // Um pequeno fade no brilho no final
      tl.to(glow, {
        opacity: 0,
        duration: 0.1,
        ease: "none",
      }, 0.9);

    }, section);

    return () => context.revert();
  }, []);

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
              // Um leve gradiente na máscara de preenchimento
              backgroundImage: "linear-gradient(90deg, #FF9900, #00FF66)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              // O texto real é branco, mas o background-clip faz ele pegar o gradiente
            }}
          >
            A arte não é opcional.
          </h2>

          {/* A "Agulha" 3D refletida na tela (Efeito Glow) */}
          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 w-1 -translate-x-1/2 bg-white shadow-[0_0_40px_10px_#FF6600]"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        <p className="mx-auto mt-12 max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] text-white/60">
          Role a página e veja a tinta ganhar vida. A mesma paixão que o tatuador coloca no estúdio, traduzida para a sua tela.
        </p>
      </div>

      {/* Linha de destaque (opcional, para amarrar o design) */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#FF6600]/50 to-transparent" />
    </section>
  );
}