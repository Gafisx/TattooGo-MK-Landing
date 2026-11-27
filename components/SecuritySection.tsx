"use client";

import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import SecurityShield from "@/components/ui/SecurityShield";

type SecuritySectionProps = {
  variant?: "client" | "artist";
};

const SECURITY_TOPICS = [
  {
    icon: Lock,
    title: "Criptografia AES-256",
    badge: "Padrão Bancário",
    description:
      "Conversas, orçamentos, referências visuais e dados de perfil trafegam e ficam protegidos com criptografia avançada.",
  },
  {
    icon: KeyRound,
    title: "Verificação de Identidade OTP",
    badge: "Acesso Autenticado",
    description:
      "Confirmação por código único (OTP) para garantir que cada cliente e tatuador na plataforma seja real.",
  },
  {
    icon: ShieldCheck,
    title: "LGPD",
    badge: "Privacidade Total",
    description:
      "Tratamento transparente de informações pessoais e controle de consentimento em conformidade com a Lei Geral de Proteção de Dados.",
  },
] as const;

/**
 * Shared security showcase highlighting real data and art protection across /clientes and /tatuadores.
 */
export default function SecuritySection({ variant = "client" }: SecuritySectionProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const isArtist = variant === "artist";
  const accentText = isArtist ? "text-[#00FF66]" : "text-[#FF9900]";
  const iconBox = isArtist
    ? "border-[#00FF66]/25 bg-[#00FF66]/10 text-[#00FF66]"
    : "border-[#FF6600]/25 bg-[#FF6600]/10 text-[#FF9900]";
  const badgeStyle = isArtist
    ? "border-[#00FF66]/25 bg-[#00FF66]/10 text-[#00FF66]"
    : "border-[#FF9900]/25 bg-[#FF9900]/10 text-[#FF9900]";

  return (
    <section
      id="seguranca"
      aria-labelledby={`security-heading-${variant}`}
      className="relative overflow-hidden border-t border-slate-800/80 bg-[#121212] px-6 py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-5"
        >
          <SecurityShield variant={variant} />
        </motion.div>

        <div className="lg:col-span-7">
          <p className={`font-mono text-xs font-semibold uppercase tracking-[0.25em] ${accentText}`}>
            Segurança Real
          </p>
          <h2
            id={`security-heading-${variant}`}
            className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            Seus dados e sua arte blindados
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
            Segurança não é promessa de marketing: é arquitetura de proteção
            aplicada à sua identidade, ao seu portfólio e às suas conversas no
            PWA.
          </p>

          <ul className="mt-8 space-y-4">
            {SECURITY_TOPICS.map(({ icon: Icon, title, badge, description }, index) => (
              <motion.li
                key={title}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: reducedMotion ? 0 : index * 0.08 }}
                className={`flex items-start gap-4 rounded-2xl border backdrop-blur-xl p-5 transition-colors hover:shadow-lg hover:shadow-black/20 ${
                  isArtist
                    ? "border-[#00FF66]/20 bg-[#00FF66]/5"
                    : "border-[#FF6600]/20 bg-[#FF6600]/5"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBox} shadow-[0_0_18px_rgba(255,153,0,0.12)]`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-white">{title}</h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${badgeStyle} shadow-[0_0_10px_rgba(255,153,0,0.15)]`}
                    >
                      {badge}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    {description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
