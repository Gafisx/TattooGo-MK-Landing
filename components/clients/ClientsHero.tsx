"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export default function ClientsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#121212]"
    >
      {/* Background image with fade-in and scroll parallax */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=1600&auto=format&fit=crop"
          alt="Tattoo art background"
          className="h-full w-full object-cover opacity-40"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/70 via-[#121212]/50 to-[#121212]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.p
          className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#FF6600]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Para Clientes
        </motion.p>

        <motion.h1
          className="font-serif text-5xl font-bold leading-tight text-white md:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          Sua próxima{" "}
          <span className="text-[#FF6600]">obra-prima</span>{" "}
          começa aqui.
        </motion.h1>

        <motion.p
          className="mx-auto mt-8 max-w-2xl text-xl text-white/75"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          Conectamos você aos melhores tatuadores do Brasil. Encontre o artista
          ideal para transformar sua ideia em arte permanente.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          <button
            type="button"
            className="rounded-full bg-[#FF6600] px-8 py-4 font-semibold text-white transition-all hover:bg-[#e55500] hover:shadow-[0_0_30px_rgba(255,102,0,0.4)]"
          >
            Encontrar Tatuadores
          </button>
          <a
            href="#estilos"
            className="rounded-full border border-white/20 px-8 py-4 font-semibold text-white/80 transition-all hover:border-[#FF6600] hover:text-[#FF6600]"
          >
            Ver Estilos
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Role para explorar</span>
          <div className="h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
