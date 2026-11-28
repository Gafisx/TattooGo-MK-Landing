"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { View } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { useScrollStore } from "@/components/scrollProgressStore";
import TattooMachineModel from "./TattooMachineModel";
import StudioLighting from "./StudioLighting";
import type { TrackRef } from "@/lib/refs";

gsap.registerPlugin(ScrollTrigger);

/**
 * viewBox provisório. Antes do primeiro paint ele é substituído pelo
 * enquadramento real dos glifos (getBBox), que é a garantia de zero corte.
 */
const FALLBACK_VIEWBOX = "0 0 1000 150";

/** Respiro lateral entre os glifos e a borda da máscara, em fração da largura. */
const LETTER_PADDING_X_RATIO = 0.012;

/** Respiro vertical entre os glifos e a borda da máscara, em fração da altura. */
const LETTER_PADDING_Y_RATIO = 0.08;

type GlyphRange = { start: number; end: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export default function ImmersiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const needleLineRef = useRef<HTMLDivElement>(null);

  // Caixa do `View` e da frase: é a mesma área, então o progresso da revelação
  // em fração da largura vale tanto para a linha da agulha no DOM quanto para a
  // posição da máquina 3D em unidades de mundo.
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = viewRef as TrackRef;
  const reducedMotion = useReducedMotion() ?? false;

  // Faixa horizontal ocupada pelos glifos dentro da caixa do SVG (0..1).
  const glyphRangeRef = useRef<GlyphRange>({ start: 0, end: 1 });
  const progressRef = useRef(0);
  const needleYRef = useRef(0);
  const textHeightRef = useRef(0);
  const [needleYFraction, setNeedleYFraction] = useState(0);
  const [textHeightFraction, setTextHeightFraction] = useState(0.2);

  const setImmersiveProgress = useScrollStore((state) => state.setImmersiveProgress);
  const setImmersiveVisible = useScrollStore((state) => state.setImmersiveVisible);

  /**
   * Aplica o mesmo progresso à máscara da frase, à guia da agulha e à máquina
   * 3D. Uma única fonte de verdade elimina qualquer desalinhamento entre a
   * ponta e a borda revelada (a animação base de scroll é preservada).
   */
  const applyReveal = useCallback(
    (progress: number) => {
      const svg = svgRef.current;
      const needleLine = needleLineRef.current;
      if (!svg || !needleLine) return;

      const p = clamp01(progress);
      progressRef.current = p;

      const { start, end } = glyphRangeRef.current;
      const edge = start + (end - start) * p;
      const boxWidth = svg.getBoundingClientRect().width;

      // A borda direita recua de 100% até 0% conforme a agulha avança.
      gsap.set(svg, { clipPath: `inset(0 ${((1 - edge) * 100).toFixed(3)}% 0 0)` });

      // A guia de luz fica exatamente sobre a borda revelada.
      gsap.set(needleLine, {
        x: edge * boxWidth,
        opacity: Math.min(1, p * 30) * Math.min(1, (1 - p) * 30),
      });

      setImmersiveProgress(edge);
    },
    [setImmersiveProgress],
  );

  /**
   * Enquadra o SVG pelo bounding box real do texto (zero corte no primeiro "A"
   * e no último "L") e informa a altura dos glifos para a ponta da máquina 3D.
   * Retorna `true` quando o enquadramento mudou e o ScrollTrigger precisa
   * recalcular as posições.
   */
  const measureText = useCallback(() => {
    const svg = svgRef.current;
    const text = textRef.current;
    const box = viewRef.current;
    if (!svg || !text) return false;

    // Ambientes sem layout de SVG (testes em happy-dom) mantêm o fallback.
    if (typeof text.getBBox !== "function") return false;

    let bbox: DOMRect;
    try {
      bbox = text.getBBox();
    } catch {
      return false;
    }
    if (!(bbox.width > 0) || !(bbox.height > 0)) return false;

    const padX = Math.max(bbox.width * LETTER_PADDING_X_RATIO, 2);
    const padY = Math.max(bbox.height * LETTER_PADDING_Y_RATIO, 2);
    const width = bbox.width + padX * 2;
    const height = bbox.height + padY * 2;

    const viewBox = `${(bbox.x - padX).toFixed(2)} ${(bbox.y - padY).toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`;
    const changed = svg.getAttribute("viewBox") !== viewBox;
    if (changed) svg.setAttribute("viewBox", viewBox);

    // Os glifos ocupam a caixa menos o respiro lateral.
    glyphRangeRef.current = { start: padX / width, end: 1 - padX / width };

    if (box) {
      const boxRect = box.getBoundingClientRect();
      const textRect = svg.getBoundingClientRect();
      if (boxRect.height > 0 && textRect.height > 0) {
        const center = boxRect.top + boxRect.height / 2;
        const next = Math.min(0.45, Math.max(-0.45, (center - textRect.top) / boxRect.height));
        if (Math.abs(next - needleYRef.current) > 0.004) {
          needleYRef.current = next;
          setNeedleYFraction(next);
        }

        const nextTextHeight = Math.min(0.9, Math.max(0.05, textRect.height / boxRect.height));
        if (Math.abs(nextTextHeight - textHeightRef.current) > 0.004) {
          textHeightRef.current = nextTextHeight;
          setTextHeightFraction(nextTextHeight);
        }
      }
    }

    return changed;
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const needleLine = needleLineRef.current;

    if (!section || !svg || !needleLine) return;

    // Máquina centralizada até a seção entrar na viewport.
    setImmersiveProgress(0.5);
    setImmersiveVisible(false);

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(svg, { clipPath: "inset(0 0% 0 0)" });
        gsap.set(needleLine, { opacity: 0 });
        return;
      }

      gsap.set(svg, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(needleLine, { x: 0, opacity: 0 });

      const reveal = { p: 0 };

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
          onRefresh: () => applyReveal(reveal.p),
        },
      });

      // Revela o texto do SVG (tatuagem acontecendo) na mesma cadência de antes.
      tl.to(
        reveal,
        {
          p: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => applyReveal(reveal.p),
        },
        0,
      );
    }, section);

    if (!reducedMotion) applyReveal(0);

    const frame = requestAnimationFrame(() => {
      const changed = measureText();
      if (!reducedMotion) applyReveal(progressRef.current);
      if (changed) ScrollTrigger.refresh();
    });

    let cancelled = false;
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (fonts) {
      fonts.ready
        .then(() => {
          if (cancelled) return;
          const changed = measureText();
          if (!reducedMotion) applyReveal(progressRef.current);
          if (changed) ScrollTrigger.refresh();
        })
        .catch(() => undefined);
    }

    const observer =
      typeof ResizeObserver === "undefined" || !viewRef.current
        ? undefined
        : new ResizeObserver(() => {
            measureText();
            if (!reducedMotion) applyReveal(progressRef.current);
          });
    observer?.observe(viewRef.current as HTMLDivElement);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      context.revert();
      setImmersiveVisible(false);
      setImmersiveProgress(0.5);
    };
  }, [
    applyReveal,
    measureText,
    reducedMotion,
    setImmersiveProgress,
    setImmersiveVisible,
  ]);

  // Mobile: o respiro inferior reserva a zona segura dos controles
  // flutuantes (áudio e TattooMenu), mantendo a frase e o parágrafo acima
  // deles. Abaixo de 360px o parágrafo sobe (mt-6) porque a coluna de texto
  // ocupa quase toda a largura e encostaria no gatilho do menu, que fica
  // ancorado no canto inferior direito. Desktop preserva o ritmo py-20.
  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-transparent pt-16 pb-[calc(env(safe-area-inset-bottom,0px)+var(--tattoo-float-safe-bottom))] sm:pt-20 sm:pb-20 [@media(max-height:560px)]:pt-4 [@media(max-height:560px)]:pb-6"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,102,0,0.05),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 text-center">
        <p className="mb-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#00FF66] [@media(max-height:560px)]:mb-4">
          A experiência imersiva
        </p>

        {/*
          CAIXA COMPARTILHADA: máquina 3D, frase e guia da agulha.
          O topo mais alto dá espaço vertical para a máquina (ela fica acima
          da frase, com a agulha tocando a linha de topo dos glifos) sem que
          o corpo seja cortado pela borda do View em nenhuma proporção.
        */}
        <div
          ref={viewRef}
          className="relative w-full pt-32 pb-12 sm:pt-48 sm:pb-16 [@media(max-height:560px)]:pt-12 [@media(max-height:560px)]:pb-6"
        >
          {/* O View recorta a máquina e as luzes para existirem APENAS dentro deste container */}
          <View track={trackRef} className="pointer-events-none absolute inset-0 z-0">
            <StudioLighting />
            <TattooMachineModel
              reducedMotion={reducedMotion}
              mode="immersive"
              needleYFraction={needleYFraction}
              textHeightFraction={textHeightFraction}
            />
          </View>

          <div className="relative block w-full">
            {/* O texto real escondido para leitores de tela e Google (SEO) */}
            <h2 className="sr-only">A arte não é opcional.</h2>

            {/* O SVG que será preenchido pela agulha */}
            <svg
              ref={svgRef}
              viewBox={FALLBACK_VIEWBOX}
              className="relative z-10 h-auto w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF9900" />
                  <stop offset="100%" stopColor="#00FF66" />
                </linearGradient>
              </defs>
              {/*
                O texto é desenhado em (0,0): o viewBox é calculado a partir do
                bbox real, então nenhuma letra fica fora da moldura em qualquer
                largura de tela.
              */}
              <text
                ref={textRef}
                x={0}
                y={0}
                fill="url(#inkGradient)"
                className="font-sans font-black tracking-tighter"
                style={{ fontSize: "90px" }}
              >
                A ARTE NÃO É OPCIONAL.
              </text>
            </svg>

            {/* Guia de luz da agulha, posicionada por translateX (GPU) */}
            <div
              ref={needleLineRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-0 z-20 -ml-px flex w-0.5 items-center justify-center"
            >
              <div className="h-full w-[2px] bg-white" />
              <div className="absolute inset-y-0 w-6 bg-[#00FF66]/50 blur-md" />
              <div className="absolute inset-y-0 w-2 bg-[#00FF66] blur-sm" />
            </div>
          </div>
        </div>

        <p className="relative z-10 mx-auto mt-12 max-w-xl text-[clamp(1rem,1.4vw,1.25rem)] text-white/60 [@media(max-width:359px)]:mt-6 [@media(max-height:560px)]:mt-5">
          Role a página e veja a tinta ganhar vida. A mesma paixão que o tatuador coloca no estúdio, traduzida para a sua tela.
        </p>
      </div>
    </section>
  );
}
