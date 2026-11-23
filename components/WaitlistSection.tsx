"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Se tiver instalado, senão use CSS puro
import { waitlistSchema } from "@/lib/validations/waitlist";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    // 1. Validação com Zod (Zero Chutes)
    const validation = waitlistSchema.safeParse({ email });
    
    if (!validation.success) {
      setStatus("error");
      setErrorMessage(validation.error.issues[0].message); // Pega o primeiro erro
      return;
    }

    // 2. Estado de Loading (Feedback visual imediato)
    setStatus("loading");

    try {
      // MOCK: Aqui futuramente entrará a chamada para o seu Backend no Render
      // await fetch('https://seu-backend.onrender.com/api/waitlist', { method: 'POST', body: JSON.stringify(validation.data) })
      
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula a rede
      
      setStatus("success");
      setEmail(""); // Limpa o campo
    } catch {
      setStatus("error");
      setErrorMessage("Ocorreu um erro. Tente novamente mais tarde.");
    }
  };

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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle"); // Limpa o erro ao digitar
                }}
                placeholder="Seu melhor e-mail"
                disabled={status === "loading" || status === "success"}
                className="w-full rounded-xl border border-white/15 bg-[#1A1A1A]/60 px-5 py-4 text-white placeholder-white/40 outline-none transition-all focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/50 disabled:opacity-50"
              />
            </div>

            {status === "error" && (
              <p className="text-sm font-medium text-[#FF6600] text-left px-2 animate-pulse">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
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