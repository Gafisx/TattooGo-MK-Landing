"use client";

import { motion } from "motion/react";
import { CalendarCheck, ShieldCheck, TrendingUp } from "lucide-react";

const DASHBOARD_METRICS = [
  {
    label: "Ganhos",
    value: "R$ 4.500",
    delta: "+18% este mês",
    icon: TrendingUp,
  },
  {
    label: "Agendamentos",
    value: "12",
    delta: "4 confirmados hoje",
    icon: CalendarCheck,
  },
];

export default function ArtistsHero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#121212] px-6 py-28">
      {/* Glows sutis em Verde Neon (#00FF66) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#00FF66]/10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-1/5 h-[360px] w-[360px] rounded-full bg-[#00FF66]/8 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:28px_28px] opacity-40"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-12">
        {/* Coluna de Copy Corporativa */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00FF66]/30 bg-[#00FF66]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#00FF66]"
          >
            <span className="h-2 w-2 rounded-full bg-[#00FF66] animate-pulse" />
            Painel Profissional
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-sans text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]"
          >
            Sua arte.{" "}
            <span className="text-slate-300">Seu negócio.</span>{" "}
            <span className="text-[#00FF66]">Seu controle.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            Portfólio verificado, gestão de agenda em tempo real e recebimentos
            transparentes para estúdios e artistas independentes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#artist-features"
              className="rounded-xl bg-[#00FF66] px-7 py-3.5 text-sm font-bold text-[#121212] transition-all hover:bg-[#1aff78] hover:shadow-[0_0_28px_rgba(0,255,102,0.35)]"
            >
              Explorar Painel
            </a>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#00FF66]" />
              <span>Dados protegidos com AES-256 e OTP</span>
            </div>
          </motion.div>
        </div>

        {/* Coluna de Mockup Flutuante do Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="lg:col-span-5"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-2xl border border-slate-300/20 bg-slate-800/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
          >
            {/* Header do card flutuante */}
            <div className="flex items-center justify-between border-b border-slate-400/15 pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
                  Studio Telemetry
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Resumo Operacional
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00FF66]/30 bg-[#00FF66]/10 px-3 py-1 font-mono text-xs font-medium text-[#00FF66]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF66]" />
                Online
              </span>
            </div>

            {/* Métricas */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DASHBOARD_METRICS.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-slate-400/15 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {metric.label}
                      </span>
                      <Icon className="h-4 w-4 text-[#00FF66]" />
                    </div>
                    <p className="mt-2 font-mono text-2xl font-bold text-white">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs text-[#00FF66]">{metric.delta}</p>
                  </div>
                );
              })}
            </div>

            {/* Barra de status inferior */}
            <div className="mt-5 rounded-xl border border-slate-400/15 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Capacidade da semana</span>
                <span className="font-mono font-semibold text-white">85%</span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-[#00FF66]/70 to-[#00FF66]" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
