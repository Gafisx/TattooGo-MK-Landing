"use client";

import { useRef } from "react";
import Image from "next/image";
import { BadgeCheck, CalendarDays, MapPin, ShieldCheck, WalletCards } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect } from "react";
import FlipCard from "./FlipCard";

gsap.registerPlugin(ScrollTrigger);

const clientBenefits = [
  { icon: MapPin, title: "Perto de você", description: "Encontre artistas e estúdios na sua região." },
  { icon: BadgeCheck, title: "Portfólios verificados", description: "Escolha com confiança, guiado por trabalhos reais." },
  { icon: ShieldCheck, title: "Segurança em cada etapa", description: "Converse e agende em uma experiência protegida." },
];

const artistBenefits = [
  { icon: CalendarDays, title: "Agenda sob controle", description: "Organize reservas, horários e confirmações em um só lugar." },
  { icon: WalletCards, title: "Ganhos transparentes", description: "Acompanhe seus resultados e pagamentos com clareza." },
  { icon: ShieldCheck, title: "Divisão automática", description: "Receba com mais previsibilidade e reduza o risco de calotes." },
];

function BenefitList({ items, tone = "orange" }: { items: typeof clientBenefits; tone?: "orange" | "green" }) {
  const iconTone = tone === "green" ? "border-[#00FF66]/25 bg-[#00FF66]/[0.08] text-[#00FF66]" : "border-[#FF6600]/25 bg-[#FF6600]/[0.08] text-[#FF9900]";
  return (
    <ul className="mt-6 grid gap-4">
      {items.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-3">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconTone}`}>
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[#E0E0E0]">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-[#E0E0E0]">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DualSidedSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Animação de entrada de cada linha
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".dual-row").forEach((row) => {
        gsap.fromTo(row, { y: 40, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: row, start: "top 80%" }
        });
      });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden bg-[#121212]/58 py-24 sm:py-32 lg:py-40" aria-labelledby="ecosystem-title">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_14%_22%,rgba(255,102,0,0.12),transparent_32%),radial-gradient(ellipse_at_88%_76%,rgba(255,153,0,0.1),transparent_34%)]" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <header className="mx-auto mb-16 max-w-3xl text-center sm:mb-24">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#FF9900] sm:text-sm">
            A mesma plataforma. Dois lados da arte.
          </p>
          <h2 className="text-[clamp(2.5rem,5.6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.065em] text-white">
            Para quem tatua.<span className="block text-white/55">Para quem escolhe o traço.</span>
          </h2>
        </header>

        <div className="space-y-24 sm:space-y-32 lg:space-y-40">
          {/* CLIENTE */}
          <article className="dual-row grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-1 lg:order-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#FF9900]">Para clientes</p>
              <h3 className="max-w-xl text-[clamp(2.4rem,4.4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-white">
                Encontre o traço que fala por você.
              </h3>
              <p className="mt-5 max-w-xl text-[clamp(1rem,1.3vw,1.125rem)] leading-relaxed text-[#E0E0E0]">
                Veja trabalhos reais, compare estilos e encontre artistas perto de você. Vire o cartão para ver como é fácil.
              </p>
              <BenefitList items={clientBenefits} />
            </div>

            {/* CARD INTERATIVO CLIENTE */}
            <div className="order-2 lg:order-1 flex justify-center">
              <FlipCard
                height="480px"
                width="min(100%, 360px)"
                front={
                  <div className="relative w-full h-full flex flex-col p-6 items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]/90 z-10" />
                    <Image src="/assets/images/cliente.webp" alt="App para clientes" fill className="object-cover opacity-60" />
                    <span className="relative z-20 text-sm font-semibold text-white bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                      Toque para explorar
                    </span>
                  </div>
                }
                back={
                  <div className="w-full h-full flex flex-col p-8 items-center justify-center text-center">
                    <MapPin className="h-12 w-12 text-[#FF9900] mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-2">Encontre seu Artista</h4>
                    <p className="text-white/60">Navegue pelo mapa, filtre por estilo e agende na hora.</p>
                    <div className="mt-8 rounded-full bg-[#FF6600] px-6 py-2 text-sm font-semibold text-[#121212]">
                      Baixar o App
                    </div>
                  </div>
                }
              />
            </div>
          </article>

          {/* TATUADOR */}
          <article className="dual-row grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-1">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-[#00FF66]">Para tatuadores</p>
              <h3 className="max-w-xl text-[clamp(2.4rem,4.4vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-white">
                Seu trabalho merece alcance. Sua agenda, controle.
              </h3>
              <p className="mt-5 max-w-xl text-[clamp(1rem,1.3vw,1.125rem)] leading-relaxed text-[#E0E0E0]">
                Apresente seu portfólio, organize horários e acompanhe os pagamentos. Vire o cartão e veja o poder na sua mão.
              </p>
              <BenefitList items={artistBenefits} tone="green" />
            </div>

            {/* CARD INTERATIVO TATUADOR */}
            <div className="order-2 flex justify-center">
              <FlipCard
                height="480px"
                width="min(100%, 360px)"
                front={
                  <div className="relative w-full h-full flex flex-col p-6 items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]/90 z-10" />
                    <Image src="/assets/images/tatuador.webp" alt="App para tatuadores" fill className="object-cover opacity-60" />
                    <span className="relative z-20 text-sm font-semibold text-white bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                      Toque para explorar
                    </span>
                  </div>
                }
                back={
                  <div className="w-full h-full flex flex-col p-8 items-center justify-center text-center">
                    <WalletCards className="h-12 w-12 text-[#00FF66] mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-2">Gestão Completa</h4>
                    <p className="text-white/60">Seu portfólio, finanças e agenda em um só painel.</p>
                    <div className="mt-8 rounded-full bg-[#00FF66] px-6 py-2 text-sm font-semibold text-[#101713]">
                      Seja Parceiro
                    </div>
                  </div>
                }
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}