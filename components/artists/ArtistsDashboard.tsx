"use client";

import { useState } from "react";
import { Clock, Lock, ShieldCheck, UserCheck } from "lucide-react";
import FuseButton from "@/components/ui/FuseButton";

const UPCOMING_SLOTS = [
  {
    time: "14:00",
    client: "Rafael Mendes",
    style: "Blackwork Geométrico — Antebraço",
    status: "Sinal confirmado",
  },
  {
    time: "17:30",
    client: "Camila Duarte",
    style: "Fine Line Botânico — Costela",
    status: "Check-in liberado",
  },
];

export default function ArtistsDashboard() {
  const [paymentReleased, setPaymentReleased] = useState(false);

  return (
    <section
      id="agenda-sem-caos"
      className="relative border-t border-slate-800/80 bg-[#121212] px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#00FF66]">
            Fluxo Operacional
          </p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Agenda Sem Caos
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Confirme sessões e libere recebimentos com segurança intencional —
            zero cliques acidentais, zero planilhas paralelas.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Card Secundário de Agenda do Dia */}
          <div className="rounded-2xl border border-slate-400/20 bg-slate-900/40 p-6 backdrop-blur-xl lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-400/15 pb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Próximas Sessões
              </h3>
              <Clock className="h-4 w-4 text-[#00FF66]" />
            </div>

            <div className="mt-5 space-y-4">
              {UPCOMING_SLOTS.map((slot) => (
                <div
                  key={slot.time}
                  className="rounded-xl border border-slate-400/15 bg-slate-800/30 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#00FF66]">
                      {slot.time}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                      <UserCheck className="h-3.5 w-3.5 text-[#00FF66]" />
                      {slot.status}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-white">{slot.client}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{slot.style}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card de Vidro Titânio com FuseButton */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-300/25 bg-slate-800/40 p-8 shadow-2xl backdrop-blur-2xl lg:col-span-7">
            <div
              aria-hidden="true"
              className="pointer-events-none -top-24 -right-24 absolute h-56 w-56 rounded-full bg-[#00FF66]/10 blur-3xl"
            />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 border-b border-slate-300/15 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-slate-300">
                  <Lock className="h-3.5 w-3.5 text-[#FF6600]" />
                  Custódia Escrow #TG-4092
                </span>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Sessão Finalizada — Rafael Mendes
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Valor retido com proteção antifraude pronto para transferência
                  instantânea.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="font-mono text-xs uppercase text-slate-400">
                  Líquido a receber
                </p>
                <p className="mt-1 font-mono text-3xl font-black text-white">
                  R$ 1.250,00
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-400/15 bg-slate-900/50 px-4 py-3 text-xs font-mono">
              <span className="text-slate-400">Status da Liquidação</span>
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${
                  paymentReleased ? "text-[#00FF66]" : "text-[#FF9900]"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                {paymentReleased
                  ? "Transferência autorizada"
                  : "Aguardando confirmação manual"}
              </span>
            </div>

            <div className="relative z-10 mt-6">
              <FuseButton
                label="Segure para liberar pagamento"
                completedLabel="Pagamento liberado"
                durationMs={2000}
                onComplete={() => setPaymentReleased(true)}
              />
              <p className="mt-3 text-center font-mono text-xs text-slate-400">
                Mantenha pressionado por 2 segundos para confirmar a operação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
