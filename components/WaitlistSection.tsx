"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { waitlistSchema, type WaitlistRole } from "@/lib/validations/waitlist";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WaitlistRole>("cliente");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const validation = waitlistSchema.safeParse({ email, role, website });

    if (!validation.success) {
      setStatus("error");
      setErrorMessage(validation.error.issues[0].message);
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          payload?.error ?? "Ocorreu um erro. Tente novamente mais tarde.",
        );
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Ocorreu um erro. Tente novamente mais tarde.");
    }
  };

  const isDisabled = status === "loading" || status === "success";

  return (
    <section className="relative overflow-hidden bg-[#121212] py-24 sm:py-32">
      {/* Fundo com efeito de fumaça (Glow) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,102,0.08),transparent_50%)]" />
      
      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          A agulha está quase pronta.
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Entre para a lista VIP e seja o primeiro a saber quando o TattooGo MK estiver disponível.
        </p>

        <div className="mt-10 mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
          {/* `noValidate`: a validação do Zod é a única fonte de verdade, com
              mensagem em português e anunciada por `role="alert"`. Sem isso o
              navegador bloqueia o envio e o erro customizado nunca aparece. */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <fieldset disabled={isDisabled} className="grid grid-cols-2 gap-2">
              <legend className="sr-only">Perfil na lista VIP</legend>
              {(
                [
                  { value: "cliente", label: "Sou Cliente" },
                  { value: "tatuador", label: "Sou Tatuador" },
                ] as const
              ).map((option) => {
                const selected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRole(option.value)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9900] ${
                      selected
                        ? "border-[#FF9900]/70 bg-[#FF6600]/15 text-[#FF9900]"
                        : "border-white/10 bg-[#1A1A1A]/40 text-white/65 hover:border-white/25 hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </fieldset>

            {/* Campo honeypot invisível para filtros automáticos anti-spam */}
            <div aria-hidden="true" className="hidden">
              <label htmlFor="waitlist-website">Website</label>
              <input
                id="waitlist-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="relative">
              <label htmlFor="waitlist-email" className="sr-only">
                Seu melhor e-mail
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={status === "error"}
                aria-describedby={status === "error" ? "waitlist-error" : undefined}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="Seu melhor e-mail"
                disabled={isDisabled}
                className="w-full rounded-xl border border-white/15 bg-[#1A1A1A]/60 px-5 py-4 text-white placeholder-white/40 outline-none transition-all focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/50 disabled:opacity-50"
              />
            </div>

            {status === "error" && (
              <p
                id="waitlist-error"
                role="alert"
                className="text-sm font-medium text-[#FF6600] text-left px-2 motion-safe:animate-pulse"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className={`group relative flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-[#121212] transition-all duration-300 ${
                status === "success"
                  ? "bg-[#00FF66] cursor-default"
                  : "bg-[#FF9900] hover:bg-[#FF6600] hover:scale-[1.02]"
              }`}
            >
              <AnimatePresence mode="wait">
                {(status === "idle" || status === "error") && (
                  <motion.span key="idle" className="flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Notificar-me
                  </motion.span>
                )}
                {status === "loading" && (
                  <motion.span key="loading" className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Enviando...
                  </motion.span>
                )}
                {status === "success" && (
                  <motion.span key="success" className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Você está na lista!
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </form>
          
          <p className="mt-6 text-xs text-white/40">
            Nós levamos sua privacidade a sério. Sem spam, apenas o aviso do lançamento.
          </p>
        </div>
      </div>
    </section>
  );
}