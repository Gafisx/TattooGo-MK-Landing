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
        const setArtistAccessibility = (revealed: boolean) => {
          artistPanel.inert = !revealed;
          if (revealed) {
            artistPanel.removeAttribute("aria-hidden");
          } else {
            artistPanel.setAttribute("aria-hidden", "true");
          }
        };

        gsap.set(clientPanel, {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 0,
        });
        gsap.set(artistPanel, {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          right: 0,
          zIndex: 1,
          clipPath: "inset(100% 0 0 0)",
        });
        gsap.set([clientImage, artistImage], {
          scale: 1.12,
          force3D: true,
          willChange: "transform",
        });
        setArtistAccessibility(false);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => setArtistAccessibility(progress > 0.02),
            onRefresh: ({ progress }) => setArtistAccessibility(progress > 0.02),
          },
        });

        timeline
          .to(
            artistPanel,
            { clipPath: "inset(0% 0 0 0)", duration: 1, ease: "none" },
            0,
          )
          .to(clientImage, { yPercent: -6, duration: 1, ease: "none" }, 0)
          .to(artistImage, { yPercent: 6, duration: 1, ease: "none" }, 0);

        return () => setArtistAccessibility(true);
      },
    );

    return () => media.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#121212]"
      aria-label="Jornadas de cliente e tatuador"
    >
      <div className="relative grid min-h-[100svh] grid-cols-1 overflow-hidden md:grid-cols-2">
        <article
          ref={clientPanelRef}
          className="relative isolate flex min-h-[78svh] items-center overflow-hidden px-5 py-16 sm:px-10 md:min-h-[100svh] md:px-12 lg:px-20"
          aria-labelledby="split-client-title"
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              ref={clientImageRef}
              src="/assets/images/cliente.webp"
              alt=""
              fill
              priority
              sizes="100vw"
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
            <div className="rounded-[1.75rem] border border-white/15 bg-[#121212]/55 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
              <h2
                id="split-client-title"
                className="text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"
              >
                Sua próxima tatuagem começa com uma ideia.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                Descubra artistas, explore portfólios e encontre o profissional
                ideal para transformar sua ideia em arte.
              </p>
              <a
                href="#clients-title"
                onMouseEnter={playHoverClick}
                onFocus={playHoverClick}
                className="mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[#FF9900]/55 bg-[#FF6600] px-6 text-sm font-semibold text-[#121212] shadow-[0_8px_32px_rgba(255,102,0,0.22)] transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,102,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF9900] active:scale-[0.98] motion-reduce:transition-none"
              >
                Encontrar Tatuador
              </a>
            </div>
          </div>
        </article>

        <article
          ref={artistPanelRef}
          className="relative isolate flex min-h-[78svh] items-center overflow-hidden px-5 py-16 sm:px-10 md:min-h-[100svh] md:px-10 lg:px-16"
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
            <div className="rounded-[1.75rem] border border-white/15 bg-[#101713]/60 p-6 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-9">
              <h2
                id="split-artist-title"
                className="text-[clamp(2.4rem,4.8vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white"
              >
                Mais espaço para criar. Mais controle para crescer.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                Organize sua agenda, apresente seu trabalho e acompanhe seus
                ganhos em uma só plataforma.
              </p>
              <a
                href="#artists-title"
                onMouseEnter={playHoverClick}
                onFocus={playHoverClick}
                className="mt-7 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-[#00FF66]/45 bg-[#00FF66] px-6 text-sm font-semibold text-[#101713] shadow-[0_8px_32px_rgba(0,255,102,0.16)] transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,102,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00FF66] active:scale-[0.98] motion-reduce:transition-none"
              >
                Sou Tatuador
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
