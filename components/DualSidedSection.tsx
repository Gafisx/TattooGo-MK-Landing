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

function BenefitList({ items }: { items: typeof clientBenefits }) {
  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
      {items.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#FF6600]/25 bg-[#FF6600]/[0.08] text-[#FF9900]">
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

export default function DualSidedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const clientRowRef = useRef<HTMLDivElement>(null);
  const artistRowRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      [clientRowRef.current, artistRowRef.current].forEach((row, index) => {
        if (!row) return;

        const visual = row.querySelector<HTMLElement>("[data-mockup]");
        const copy = row.querySelector<HTMLElement>("[data-copy]");
        if (!visual || !copy) return;

        gsap.set([visual, copy], {
          force3D: true,
          willChange: "transform, opacity",
        });

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

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#121212] py-24 sm:py-32 lg:py-40"
      aria-labelledby="ecosystem-title"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_14%_22%,rgba(255,102,0,0.12),transparent_32%),radial-gradient(ellipse_at_88%_76%,rgba(255,153,0,0.1),transparent_34%)]" />

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
            <div
              data-mockup
              className="gpu-accelerate relative order-2 mx-auto flex h-[min(76vh,760px)] min-h-[480px] w-full max-w-[560px] items-center justify-center lg:order-1"
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6600]/15 blur-[90px]" />
              <Image
                src="/assets/images/cliente.png"
                alt="Aplicativo TattooGo para clientes com mapa e portfólios de tatuadores verificados"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="gpu-accelerate object-contain"
              />
            </div>

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
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#FF9900]">
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
              <BenefitList items={artistBenefits} />
            </div>

            <div
              data-mockup
              className="gpu-accelerate relative order-2 mx-auto flex h-[min(76vh,760px)] min-h-[480px] w-full max-w-[560px] items-center justify-center"
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9900]/15 blur-[90px]" />
              <Image
                src="/assets/images/tatuador.png"
                alt="Painel TattooGo para tatuadores com portfólio, ganhos, agenda e split payments"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="gpu-accelerate object-contain"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
