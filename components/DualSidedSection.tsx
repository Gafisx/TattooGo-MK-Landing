"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const clientBenefits = [
  {
    icon: MapPin,
    title: "Perto de você",
    description: "Encontre artistas e estúdios na sua região.",
  },
  {
    icon: BadgeCheck,
    title: "Portfólios verificados",
    description: "Escolha com confiança, guiado por trabalhos reais.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança em cada etapa",
    description: "Converse e agende em uma experiência protegida.",
  },
];

const artistBenefits = [
  {
    icon: CalendarDays,
    title: "Agenda sob controle",
    description: "Organize reservas, horários e confirmações em um só lugar.",
  },
  {
    icon: WalletCards,
    title: "Ganhos transparentes",
    description: "Acompanhe seus resultados e pagamentos com clareza.",
  },
  {
    icon: ShieldCheck,
    title: "Split payments automatizados",
    description: "Receba com mais previsibilidade e reduza o risco de calotes.",
  },
];

function BenefitList({
  items,
  tone = "orange",
}: {
  items: typeof clientBenefits;
  tone?: "orange" | "green";
}) {
  const iconTone =
    tone === "green"
      ? "border-[#00FF66]/25 bg-[#00FF66]/[0.08] text-[#00FF66]"
      : "border-[#FF6600]/25 bg-[#FF6600]/[0.08] text-[#FF9900]";

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
      {items.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconTone}`}
          >
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-white/55">
              {description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MarketplaceMockup({
  src,
  alt,
  sizes,
  label,
  descriptor,
  tone,
}: {
  src: string;
  alt: string;
  sizes: string;
  label: string;
  descriptor: string;
  tone: "orange" | "green";
}) {
  const accent =
    tone === "green"
      ? {
          border: "border-[#00FF66]/30 hover:border-[#00FF66]/65",
          glow: "bg-[#00FF66]/[0.08]",
          aura: "bg-[#00FF66]/25",
          reveal:
            "bg-[linear-gradient(115deg,rgba(18,18,18,0.96)_0%,rgba(0,255,102,0.34)_52%,rgba(73,119,255,0.18)_100%)]",
          label: "text-[#00FF66]",
        }
      : {
          border: "border-[#FF6600]/30 hover:border-[#FF6600]/65",
          glow: "bg-[#FF6600]/[0.1]",
          aura: "bg-[#FF6600]/25",
          reveal:
            "bg-[linear-gradient(115deg,rgba(18,18,18,0.96)_0%,rgba(255,102,0,0.36)_52%,rgba(255,153,0,0.18)_100%)]",
          label: "text-[#FF9900]",
        };

  return (
    <div
      data-mockup
      className={`gpu-accelerate relative order-2 mx-auto flex h-[min(76vh,760px)] min-h-[480px] w-full max-w-[560px] items-center justify-center [perspective:1200px] ${tone === "orange" ? "lg:order-1" : "lg:order-2"}`}
    >
      <div
        data-aura
        aria-hidden="true"
        className={`gpu-accelerate pointer-events-none absolute inset-[4%] rounded-[2.5rem] opacity-60 blur-[75px] ${accent.aura}`}
      />
      <div
        data-tilt
        className={`gpu-accelerate-child group relative isolate h-full w-full overflow-hidden rounded-[2rem] border bg-[#171717]/50 p-4 backdrop-blur-xl [transform-style:preserve-3d] transition-[border-color] duration-500 motion-reduce:transition-none ${accent.border}`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-[12%] rounded-full blur-[90px] ${accent.glow}`}
        />
        <div className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.015] to-transparent" />

        <div className="gpu-accelerate-child absolute inset-5 [transform:translate3d(0,0,26px)]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div
          data-ink-reveal
          aria-hidden="true"
          className={`gpu-accelerate-child pointer-events-none absolute inset-5 z-[1] origin-right rounded-[1.4rem] motion-reduce:scale-x-0 ${accent.reveal}`}
        />

        <div className="gpu-accelerate-child absolute left-7 top-7 z-10 rounded-xl border border-white/10 bg-[#121212]/65 px-3 py-2 backdrop-blur-lg [transform:translate3d(0,0,48px)]">
          <p
            className={`text-[9px] font-semibold uppercase tracking-[0.2em] ${accent.label}`}
          >
            {label}
          </p>
          <p className="mt-1 text-[11px] text-white/75">{descriptor}</p>
        </div>

        <div className="gpu-accelerate-child absolute bottom-7 right-7 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-[#121212]/65 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/65 backdrop-blur-lg [transform:translate3d(0,0,42px)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]" />
          Verified
        </div>
      </div>
    </div>
  );
}

export default function DualSidedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const clientRowRef = useRef<HTMLDivElement>(null);
  const artistRowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cleanupTilt: Array<() => void> = [];
    const context = gsap.context(() => {
      [clientRowRef.current, artistRowRef.current].forEach((row, index) => {
        if (!row) return;

        const visual = row.querySelector<HTMLElement>("[data-mockup]");
        const aura = row.querySelector<HTMLElement>("[data-aura]");
        const inkReveal = row.querySelector<HTMLElement>("[data-ink-reveal]");
        const tiltCard = row.querySelector<HTMLElement>("[data-tilt]");
        const copy = row.querySelector<HTMLElement>("[data-copy]");
        if (!visual || !aura || !inkReveal || !tiltCard || !copy) return;

        gsap.set([visual, aura, inkReveal, copy], {
          force3D: true,
          willChange: "transform, opacity",
        });
        gsap.set(inkReveal, {
          scaleX: 1,
          transformOrigin: "right center",
        });
        gsap.set(tiltCard, {
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
          force3D: true,
          willChange: "transform",
        });

        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          const rotateX = gsap.quickTo(tiltCard, "rotationX", {
            duration: 0.55,
            ease: "power3.out",
            force3D: true,
          });
          const rotateY = gsap.quickTo(tiltCard, "rotationY", {
            duration: 0.55,
            ease: "power3.out",
            force3D: true,
          });
          const handlePointerMove = (event: PointerEvent) => {
            const bounds = tiltCard.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            rotateX(y * -7);
            rotateY(x * 9);
          };
          const resetTilt = () => {
            rotateX(0);
            rotateY(0);
          };

          tiltCard.addEventListener("pointermove", handlePointerMove, {
            passive: true,
          });
          tiltCard.addEventListener("pointerleave", resetTilt, {
            passive: true,
          });
          cleanupTilt.push(() => {
            tiltCard.removeEventListener("pointermove", handlePointerMove);
            tiltCard.removeEventListener("pointerleave", resetTilt);
            gsap.killTweensOf(tiltCard);
          });
        }

        gsap.fromTo(
          visual,
          {
            xPercent: index === 0 ? -8 : 8,
            yPercent: 7,
            autoAlpha: 0,
          },
          {
            xPercent: 0,
            yPercent: 0,
            autoAlpha: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 78%",
              end: "top 34%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );

        gsap.fromTo(
          aura,
          { scale: 0.78, autoAlpha: 0.2, y: 18 },
          {
            scale: 1.08,
            autoAlpha: 0.9,
            y: -8,
            ease: "none",
            scrollTrigger: {
              trigger: row,
              start: "top 82%",
              end: "top 28%",
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
          },
        );

        gsap.to(inkReveal, {
          scaleX: 0,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top 76%",
            end: "top 32%",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.fromTo(
          copy,
          { x: index === 0 ? 28 : -28, y: 20, autoAlpha: 0 },
          {
            x: 0,
            y: 0,
            autoAlpha: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 76%",
              end: "top 38%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, section);

    return () => {
      cleanupTilt.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#121212]/68 py-24 sm:py-32 lg:py-40"
      aria-labelledby="ecosystem-title"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_14%_22%,rgba(255,102,0,0.12),transparent_32%),radial-gradient(ellipse_at_88%_76%,rgba(255,153,0,0.1),transparent_34%),radial-gradient(ellipse_at_52%_50%,rgba(0,255,102,0.045),transparent_38%),radial-gradient(ellipse_at_92%_18%,rgba(73,119,255,0.06),transparent_26%)]" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <header className="mx-auto mb-16 max-w-3xl text-center sm:mb-24 lg:mb-32">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#FF9900] sm:text-sm">
            Um ecossistema. Duas jornadas.
          </p>
          <h2
            id="ecosystem-title"
            className="text-[clamp(2.5rem,5.6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.065em] text-white"
          >
            Feito para quem
            <span className="block text-white/45">cria e para quem sente.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
            A tecnologia aproxima pessoas e transforma a descoberta, a criação
            e a gestão de cada tatuagem em uma experiência mais segura.
          </p>
        </header>

        <div className="space-y-24 sm:space-y-32 lg:space-y-40">
          <article
            ref={clientRowRef}
            className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16"
            aria-labelledby="clients-title"
          >
            <MarketplaceMockup
              src="/assets/images/cliente.png"
              alt="Aplicativo TattooGo para clientes com mapa e portfólios de tatuadores verificados"
              sizes="(max-width: 1024px) 90vw, 45vw"
              label="Descoberta local"
              descriptor="Artistas perto de você"
              tone="orange"
            />

            <div data-copy className="gpu-accelerate order-1 lg:order-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#FF9900]">
                Para clientes
              </p>
              <h3
                id="clients-title"
                className="max-w-xl text-[clamp(2.4rem,4.4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-white"
              >
                A sua próxima tatuagem começa aqui.
              </h3>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                Descubra artistas que combinam com a sua ideia. Explore
                trabalhos autênticos, encontre talentos por geolocalização e
                agende com tranquilidade — do primeiro contato ao resultado
                final.
              </p>
              <BenefitList items={clientBenefits} />
            </div>
          </article>

          <article
            ref={artistRowRef}
            className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16"
            aria-labelledby="artists-title"
          >
            <div data-copy className="gpu-accelerate order-1">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#00FF66]">
                Para tatuadores
              </p>
              <h3
                id="artists-title"
                className="max-w-xl text-[clamp(2.4rem,4.4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-white"
              >
                Mais tempo para criar. Controle para crescer.
              </h3>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
                Seu talento merece uma operação à altura. Reúna agenda,
                portfólio e desempenho em um painel intuitivo, enquanto os
                pagamentos acompanham cada reserva com mais transparência.
              </p>
              <BenefitList items={artistBenefits} tone="green" />
            </div>

            <MarketplaceMockup
              src="/assets/images/tatuador.png"
              alt="Painel TattooGo para tatuadores com portfólio, ganhos, agenda e split payments"
              sizes="(max-width: 1024px) 90vw, 45vw"
              label="Painel do artista"
              descriptor="Ganhos e split payments"
              tone="green"
            />
          </article>
        </div>
      </div>
    </section>
  );
}
