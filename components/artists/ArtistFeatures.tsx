"use client";

import { BadgeCheck, CalendarCheck, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const ARTIST_FEATURES = [
  {
    icon: BadgeCheck,
    badge: "Autenticidade",
    title: "Portfólio Verificado",
    description:
      "Mostre seus traços e estilos com selo de verificação e apareça no mapa imersivo para clientes que procuram exatamente o seu trabalho.",
  },
  {
    icon: CalendarCheck,
    badge: "Organização",
    title: "Gestão de Agenda",
    description:
      "Gerencie pedidos de orçamento, confirme horários de sessão e visualize sua semana sem depender de planilhas ou mensagens perdidas.",
  },
  {
    icon: Wallet,
    badge: "Visão Clara",
    title: "Recebimentos Transparentes",
    description:
      "Acompanhe valores combinados, sinais registrados e o histórico de cada sessão com previsibilidade total no seu painel.",
  },
] as const;

/**
 * Showcase of real PWA features for tattoo artists on /tatuadores.
 */
export default function ArtistFeatures() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="artist-features"
      aria-labelledby="artist-features-title"
      className="relative overflow-hidden border-t border-slate-800/80 bg-[#121212] px-6 py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#00FF66]/10 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#00FF66]">
            Painel do Tatuador
          </p>
          <h2
            id="artist-features-title"
            className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            O controle total da sua arte.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Organize sua rotina de estúdio, destaque seu portfólio verificado e
            mantenha cada sessão registrada em um único PWA.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ARTIST_FEATURES.map(({ icon: Icon, badge, title, description }, index) => (
            <motion.article
              key={title}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: reducedMotion ? 0 : index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-300/20 bg-slate-800/40 p-7 shadow-xl backdrop-blur-2xl transition-colors hover:border-[#00FF66]/50"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/12 text-[#00FF66]">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-[#00FF66]/25 bg-[#00FF66]/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#00FF66]">
                  {badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
