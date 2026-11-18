"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ImmersiveExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const orangeGlowRef = useRef<HTMLDivElement>(null);
  const greenGlowRef = useRef<HTMLDivElement>(null);
  const electricGlowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap.set(headlineRef.current, {
        opacity: 0,
        y: 48,
        transformPerspective: 1200,
        force3D: true,
        willChange: "transform, opacity",
      });
      gsap.set(detailRef.current, {
        opacity: 0,
        y: 24,
        force3D: true,
        willChange: "transform, opacity",
      });
      gsap.set(
        [
          orangeGlowRef.current,
          greenGlowRef.current,
          electricGlowRef.current,
        ],
        {
          force3D: true,
          willChange: "transform",
        },
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=220%",
          scrub: 1.1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(
          headlineRef.current,
          { opacity: 1, y: 0, duration: 0.28, ease: "power3.out" },
          0.03,
        )
        .to(
          orangeGlowRef.current,
          {
            xPercent: 18,
            yPercent: -12,
            scale: 1.12,
            duration: 0.82,
            ease: "none",
          },
          0.08,
        )
        .to(
          greenGlowRef.current,
          {
            xPercent: -16,
            yPercent: 12,
            scale: 1.18,
            duration: 0.82,
            ease: "none",
          },
          0.08,
        )
        .to(
          electricGlowRef.current,
          {
            xPercent: 10,
            yPercent: 14,
            scale: 1.1,
            duration: 0.82,
            ease: "none",
          },
          0.08,
        )
        .to(
          detailRef.current,
          { opacity: 1, y: 0, duration: 0.22, ease: "power3.out" },
          0.66,
        );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="gpu-accelerate relative h-[100svh] min-h-[640px] overflow-hidden bg-[#121212]/55"
      aria-labelledby="immersive-experience-title"
    >
      <Image
        src="/assets/images/hero-texture-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="gpu-accelerate object-cover opacity-22"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.92)_0%,rgba(18,18,18,0.48)_42%,rgba(18,18,18,0.12)_100%)]" />
      <div
        ref={orangeGlowRef}
        aria-hidden="true"
        className="gpu-accelerate pointer-events-none absolute -right-[12%] top-[5%] h-[55vw] max-h-[700px] w-[55vw] max-w-[700px] rounded-full bg-[#FF6600]/20 blur-[100px]"
      />
      <div
        ref={greenGlowRef}
        aria-hidden="true"
        className="gpu-accelerate pointer-events-none absolute -bottom-[28%] left-[12%] h-[48vw] max-h-[620px] w-[48vw] max-w-[620px] rounded-full bg-[#00FF66]/10 blur-[110px]"
      />
      <div
        ref={electricGlowRef}
        aria-hidden="true"
        className="gpu-accelerate pointer-events-none absolute right-[22%] top-[20%] h-[34vw] max-h-[440px] w-[34vw] max-w-[440px] rounded-full bg-[radial-gradient(circle,rgba(73,119,255,0.16),rgba(141,67,255,0.1)_42%,transparent_72%)] blur-[65px]"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] items-center px-6 sm:px-10 lg:px-16">
        <div
          ref={headlineRef}
          className="gpu-accelerate relative z-20 max-w-[520px]"
        >
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF9900]">
            <span className="h-px w-10 bg-[#FF6600]" />
            Arte em movimento
          </p>
          <h1
            id="immersive-experience-title"
            className="text-[clamp(3.25rem,8vw,7.5rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-white"
          >
            Cada traço
            <span className="block text-[#FF6600]">conta sua história.</span>
          </h1>
        </div>

        <div
          ref={detailRef}
          className="gpu-accelerate absolute bottom-8 right-6 z-20 max-w-[280px] rounded-2xl border border-white/10 bg-[#1A1A1A]/85 p-5 backdrop-blur-md sm:bottom-12 sm:right-10 lg:right-16"
        >
          <p className="text-sm leading-6 text-white/72">
            Conecte sua ideia ao artista certo, com segurança e transparência
            em cada etapa.
          </p>
        </div>
      </div>
    </section>
  );
}
