"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProceduralAudio } from "@/components/useProceduralAudio";

gsap.registerPlugin(ScrollTrigger);

export default function SplitJourneySection() {
  const { playHoverClick } = useProceduralAudio();
  const sectionRef = useRef<HTMLElement>(null);
  const clientPanelRef = useRef<HTMLElement>(null);
  const artistPanelRef = useRef<HTMLElement>(null);
  const clientImageRef = useRef<HTMLImageElement>(null);
  const artistImageRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const clientPanel = clientPanelRef.current;
    const artistPanel = artistPanelRef.current;
    const clientImage = clientImageRef.current;
    const artistImage = artistImageRef.current;
    if (!section || !clientPanel || !artistPanel || !clientImage || !artistImage) {
      return;
    }

    const media = gsap.matchMedia();
    media.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const tiltCleanups: Array<() => void> = [];
        const updatePanelInteractivity = (progress: number) => {
          const clientActive = progress <= 0.001;
          const artistActive = progress >= 0.999;

          clientPanel.inert = !clientActive;
          clientPanel.style.pointerEvents = clientActive ? "auto" : "none";
          clientPanel.toggleAttribute("aria-hidden", !clientActive);
          artistPanel.inert = !artistActive;
          artistPanel.style.pointerEvents = artistActive ? "auto" : "none";
          artistPanel.toggleAttribute("aria-hidden", !artistActive);
        };

        gsap.set(clientPanel, {
          position: "absolute",
          inset: 0,
          zIndex: 2,
          clipPath: "inset(0 0 0 0)",
        });
        gsap.set(artistPanel, {
          position: "absolute",
          inset: 0,
          zIndex: 1,
        });
        gsap.set([clientImage, artistImage], {
          scale: 1.12,
          force3D: true,
          willChange: "transform",
        });
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          section
            .querySelectorAll<HTMLElement>("[data-split-tilt]")
            .forEach((card) => {
              gsap.set(card, {
                transformPerspective: 1000,
                transformStyle: "preserve-3d",
                force3D: true,
                willChange: "transform",
              });
              const rotateX = gsap.quickTo(card, "rotationX", {
                duration: 0.55,
                ease: "power3.out",
                force3D: true,
              });
              const rotateY = gsap.quickTo(card, "rotationY", {
                duration: 0.55,
                ease: "power3.out",
                force3D: true,
              });
              const handlePointerMove = (event: PointerEvent) => {
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                rotateX(y * -4);
                rotateY(x * 5);
              };
              const resetTilt = () => {
                rotateX(0);
                rotateY(0);
              };

              card.addEventListener("pointermove", handlePointerMove, {
                passive: true,
              });
              card.addEventListener("pointerleave", resetTilt, {
                passive: true,
              });
              tiltCleanups.push(() => {
                card.removeEventListener("pointermove", handlePointerMove);
                card.removeEventListener("pointerleave", resetTilt);
                gsap.killTweensOf(card);
              });
            });
        }
        updatePanelInteractivity(0);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => updatePanelInteractivity(progress),
            onRefresh: ({ progress }) => updatePanelInteractivity(progress),
          },
        });

        timeline
          .to(
            clientPanel,
            { clipPath: "inset(0 100% 0 0)", duration: 1, ease: "none" },
            0,
          )
          .to(clientImage, { yPercent: -6, duration: 1, ease: "none" }, 0)
          .to(artistImage, { yPercent: 6, duration: 1, ease: "none" }, 0);

        return () => {
          tiltCleanups.forEach((cleanup) => cleanup());
          clientPanel.inert = false;
          clientPanel.style.pointerEvents = "";
          clientPanel.removeAttribute("aria-hidden");
          artistPanel.inert = false;
          artistPanel.style.pointerEvents = "";
          artistPanel.removeAttribute("aria-hidden");
        };
      },
    );

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-auto overflow-hidden bg-[#121212] md:h-screen md:min-h-[640px]"
      aria-label="Jornadas de cliente e tatuador"
    >
      <div className="relative grid grid-cols-1 overflow-hidden md:h-full md:grid-cols-2">
        <article
          ref={clientPanelRef}
          className="relative isolate flex min-h-[78svh] items-center overflow-hidden px-5 py-16 sm:px-10 md:h-full md:min-h-0 md:px-12 lg:px-20"
          aria-labelledby="split-client-title"
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              ref={clientImageRef}
              src="/assets/images/cliente.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.82),rgba(10,10,10,0.42)_58%,rgba(10,10,10,0.56)),linear-gradient(0deg,rgba(10,10,10,0.28),transparent_58%)]"
          />

          <div className="relative z-10 mx-auto w-full max-w-[500px] md:mx-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF9900] sm:text-sm">
              Para clientes
            </p>
            <div data-split-tilt className="rounded-[1.75rem] border border-white/20 bg-[#121212]/55 p-6 text-[#E0E0E0] shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
              <h2
                id="split-client-title"
                className="text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"
              >
                Encontre quem entende o que você quer marcar.
              </h2>
              <p className="mt-5 max-w-md text-[clamp(0.875rem,1.1vw,1rem)] leading-relaxed">
                Pesquise por estilo e região. Veja trabalhos, converse com o
                artista e reserve com clareza.
              </p>
              <a
                href="#clients-title"
                onMouseEnter={playHoverClick}
                onFocus={playHoverClick}
                className="cta-microphysics mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[#FF9900]/55 bg-[#FF6600] px-6 text-sm font-semibold text-[#121212] shadow-[0_8px_32px_rgba(255,102,0,0.22)] transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900] motion-reduce:transition-none"
              >
                Explorar artistas
              </a>
            </div>
          </div>
        </article>

        <article
          ref={artistPanelRef}
          className="relative isolate flex min-h-[78svh] items-center overflow-hidden px-5 py-16 sm:px-10 md:h-full md:min-h-0 md:px-10 lg:px-16"
          aria-labelledby="split-artist-title"
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              ref={artistImageRef}
              src="/assets/images/tatuador.webp"
              alt=""
              fill
              loading="lazy"
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,10,0.58),rgba(8,12,10,0.78)),linear-gradient(0deg,rgba(8,12,10,0.4),transparent_65%)]"
          />

          <div className="relative z-10 mx-auto w-full max-w-[500px] md:mx-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#00FF66] sm:text-sm">
              Para tatuadores
            </p>
            <div data-split-tilt className="rounded-[1.75rem] border border-white/20 bg-[#101713]/60 p-6 text-[#E0E0E0] shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
              <h2
                id="split-artist-title"
                className="text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"
              >
                Menos operação. Mais tempo no traço.
              </h2>
              <p className="mt-5 max-w-md text-[clamp(0.875rem,1.1vw,1rem)] leading-relaxed">
                Apresente seu portfólio, organize a agenda e responda orçamentos
                sem perder o foco no estúdio.
              </p>
              <a
                href="#artists-title"
                onMouseEnter={playHoverClick}
                onFocus={playHoverClick}
                className="cta-microphysics mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[#00FF66]/45 bg-[#00FF66] px-6 text-sm font-semibold text-[#101713] shadow-[0_8px_32px_rgba(0,255,102,0.16)] transition-[transform,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF66] motion-reduce:transition-none"
              >
                Organizar meu estúdio
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
