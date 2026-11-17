"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TattooScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

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
      });
      gsap.set(detailRef.current, {
        opacity: 0,
        y: 24,
      });
      gsap.set(revealRef.current, {
        clipPath: "inset(0 100% 0 0)",
        transform: "translateZ(0)",
        willChange: "clip-path, opacity",
      });
      gsap.set(needleRef.current, {
        xPercent: 12,
        yPercent: -4,
        rotate: -2,
        scale: 1.08,
        transformPerspective: 1200,
        transformOrigin: "68% 56%",
        willChange: "transform",
      });

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
          revealRef.current,
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.72,
            ease: "power2.inOut",
          },
          0.08,
        )
        .to(
          needleRef.current,
          {
            xPercent: -8,
            yPercent: 7,
            rotate: 3,
            scale: 0.94,
            duration: 0.78,
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
      className="gpu-accelerate relative h-[100svh] min-h-[640px] overflow-hidden bg-[#121212]"
      aria-labelledby="tattoo-scroll-title"
    >
      <Image
        src="/assets/images/hero-texture-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="gpu-accelerate object-cover"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(255,153,0,0.13),transparent_26%),linear-gradient(90deg,rgba(18,18,18,0.96)_0%,rgba(18,18,18,0.58)_42%,rgba(18,18,18,0.1)_100%)]" />

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
            id="tattoo-scroll-title"
            className="text-[clamp(3.25rem,8vw,7.5rem)] font-semibold leading-[0.84] tracking-[-0.065em] text-white"
          >
            Cada traço
            <span className="block text-[#FF6600]">conta sua história.</span>
          </h1>
        </div>

        <div
          ref={revealRef}
          className="gpu-accelerate absolute inset-0 overflow-hidden"
        >
          <div
            ref={needleRef}
            className="gpu-accelerate absolute inset-[-5%] sm:inset-[-3%]"
          >
            <Image
              src="/assets/images/tattoo-needle-scroll-hero.png"
              alt="Agulha de tatuagem desenhando um traço de tinta"
              fill
              priority
              sizes="(max-width: 768px) 110vw, 100vw"
              className="gpu-accelerate object-cover object-center"
            />
          </div>
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
