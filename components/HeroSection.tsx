"use client";

import Image from "next/image";
import { Apple, ArrowUpRight, Play, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="top"
      className="gpu-accelerate relative isolate flex min-h-[100svh] overflow-hidden bg-[#121212]"
      aria-labelledby="hero-title"
    >
      <Image
        src="/assets/images/hero-texture-background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="gpu-accelerate object-cover object-[58%_center]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,18,18,0.98)_0%,rgba(18,18,18,0.88)_38%,rgba(18,18,18,0.34)_72%,rgba(18,18,18,0.72)_100%),radial-gradient(circle_at_78%_46%,rgba(255,102,0,0.22),transparent_25%),linear-gradient(180deg,rgba(18,18,18,0.18),rgba(18,18,18,0.82)_100%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:px-16 lg:py-14 2xl:px-20">
        <div className="gpu-accelerate relative z-20 max-w-[720px] pt-10 lg:pt-0">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF9900]/25 bg-[#1A1A1A]/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#FF9900] backdrop-blur-md sm:text-xs">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Arte. Tecnologia. Segurança.
          </div>

          <h1
            id="hero-title"
            className="text-[clamp(3.25rem,7.4vw,8.25rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-white"
          >
            TattooGo
            <span className="mt-2 block bg-gradient-to-r from-[#FF6600] to-[#FF9900] bg-clip-text text-transparent">
              MK
            </span>
          </h1>

          <p className="mt-7 max-w-[590px] text-[clamp(1.05rem,1.45vw,1.35rem)] leading-[1.65] text-white/72 sm:mt-8">
            Uma experiência premium que une artistas, ideias e histórias.
            Descubra talentosos profissionais e agende sua próxima tatuagem
            com confiança, tecnologia e segurança.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-store-button group gpu-accelerate flex min-h-16 items-center gap-3 rounded-2xl border border-white/12 bg-white px-5 text-[#121212] shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#FF6600]/70 hover:shadow-[0_18px_55px_rgba(255,102,0,0.24)] sm:min-w-[218px]"
            >
              <Apple aria-hidden="true" className="h-7 w-7 shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-[0.12em] text-black/55">
                  Baixar na
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight">
                  App Store
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 opacity-45 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>

            <a
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-store-button group gpu-accelerate flex min-h-16 items-center gap-3 rounded-2xl border border-white/14 bg-[#1A1A1A]/90 px-5 text-white backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#FF6600] hover:shadow-[0_18px_55px_rgba(255,102,0,0.22)] sm:min-w-[218px]"
            >
              <Play
                aria-hidden="true"
                className="h-7 w-7 shrink-0 fill-[#FF6600] text-[#FF6600]"
              />
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="text-[0.63rem] font-medium uppercase tracking-[0.12em] text-white/55">
                  Disponível no
                </span>
                <span className="text-[1.05rem] font-semibold leading-tight">
                  Google Play
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 text-[#FF9900] opacity-45 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>

        <div className="gpu-accelerate relative h-[36vh] min-h-[260px] w-full sm:h-[42vh] lg:h-[72vh] lg:min-h-[540px]">
          <div className="absolute inset-[-8%] -left-[18%] sm:left-[-8%] lg:-left-[4%]">
            <Image
              src="/assets/images/tattoo-needle-scroll-hero.png"
              alt="Agulha profissional TattooGo MK criando um traço de tinta"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="gpu-accelerate needle-art object-contain"
            />
          </div>
          <div className="pointer-events-none absolute bottom-[8%] right-[4%] h-28 w-28 rounded-full bg-[#FF6600]/15 blur-3xl sm:h-44 sm:w-44" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF6600]/50 to-transparent" />
    </section>
  );
}
