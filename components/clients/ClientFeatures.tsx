"use client";

import { MapPin, MessageSquareQuote, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const CLIENT_FEATURES = [
  {
    icon: Sparkles,
    badge: "IA Integrada",
    title: "Assistente de IA (TattooGo Studio)",
    description:
      "Transforme ideias soltas em referências visuais claras, explore combinações de estilos e prepare seu briefing antes de chamar o artista.",
  },
  {
    icon: MapPin,
    badge: "Geolocalização",
    title: "Mapa Imersivo",
    description:
      "Explore estúdios e tatuadores perto de você em tempo real, filtrando por especialidade, distância e disponibilidade.",
  },
  {
    icon: MessageSquareQuote,
    badge: "Contato Direto",
    title: "Chat e Orçamentos",
    description:
      "Envie suas referências, alinhe tamanho e região do corpo e receba orçamentos transparentes direto com o tatuador.",
  },
] as const;

/**
 * Showcase of real PWA features for clients on /clientes.
 */
export default function ClientFeatures() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section
      id="client-features"
      aria-labelledby="client-features-title"
      className="relative overflow-hidden border-t border-slate-800/80 bg-[#121212] px-6 py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-[#FF6600]/10 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#FF9900]">
            Experiência no PWA
          </p>
          <h2
            id="client-features-title"
            className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Uma experiência que entende você.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Da inspiração inicial ao orçamento aprovado no estúdio, tudo
            acontece em um fluxo simples no seu navegador ou app instalado.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {CLIENT_FEATURES.map(({ icon: Icon, badge, title, description }, index) => (
            <motion.article
              key={title}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: reducedMotion ? 0 : index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-300/20 bg-slate-800/40 p-7 shadow-xl backdrop-blur-2xl transition-colors hover:border-[#FF6600]/50"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6600]/30 bg-[#FF6600]/15 text-[#FF9900]">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-[#FF9900]/25 bg-[#FF9900]/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#FF9900]">
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
