"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Apple,
  Check,
  LockKeyhole,
  Play,
  ShieldCheck,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const securityPoints = [
  {
    icon: LockKeyhole,
    title: "Transações criptografadas",
    description:
      "Seus dados e pagamentos protegidos por uma camada segura em cada etapa.",
  },
  {
    icon: ShieldCheck,
    title: "Split payments automatizados",
    description:
      "O saldo é liberado com segurança entre cliente e tatuador, conforme as condições da reserva.",
  },
  {
    icon: Check,
    title: "Perfis verificados",
    description:
      "Uma comunidade com mais confiança para encontrar, contratar e criar.",
  },
];

export default function SecurityAndFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const context = gsap.context(() => {
      [shieldRef.current, copyRef.current, ctaRef.current].forEach((element) => {
        if (element) {
          gsap.set(element, {
            force3D: true,
            willChange: "transform, opacity",
          });
        }
      });

      gsap.fromTo(
        shieldRef.current,
        { xPercent: 8, y: 36, autoAlpha: 0 },
        {
          xPercent: 0,
          y: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "top 28%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.fromTo(
        copyRef.current,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "top 30%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.fromTo(
        ctaRef.current,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 88%",
            end: "top 52%",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        },
      );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      className="relative isolate overflow-hidden bg-[#121212] pt-24 sm:pt-32 lg:pt-40"
      aria-labelledby="security-title"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_24%,rgba(255,102,0,0.14),transparent_30%),radial-gradient(ellipse_at_14%_66%,rgba(255,153,0,0.08),transparent_30%)]" />

      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-24 sm:px-10 sm:pb-32 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-16 lg:pb-40">
        <div
          ref={shieldRef}
          className="gpu-accelerate relative mx-auto aspect-square w-full max-w-[620px]"
        >
          <div className="pointer-events-none absolute inset-[14%] rounded-full bg-[#FF6600]/15 blur-[90px]" />
          <Image
            src="/assets/images/security-split-payments-shield.png"
            alt="Escudo TattooGo MK simbolizando a proteção dos pagamentos entre cliente e tatuador"
            fill
            sizes="(max-width: 1024px) 90vw, 48vw"
            className="gpu-accelerate object-contain"
          />
        </div>

        <div ref={copyRef} className="gpu-accelerate">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF9900] sm:text-sm">
            <span className="h-px w-9 bg-[#FF6600]" />
            Confiança em cada transação
          </p>
          <h2
            id="security-title"
            className="max-w-2xl text-[clamp(2.6rem,5vw,5.25rem)] font-semibold leading-[0.91] tracking-[-0.065em] text-white"
          >
            Segurança que protege
            <span className="block text-white/45">o valor da sua arte.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
            Cada reserva merece tranquilidade. O TattooGo MK combina
            transações criptografadas, perfis verificados e split payments
            automatizados para dar mais segurança a quem cria e a quem escolhe.
          </p>

          <ul className="mt-8 space-y-5 sm:mt-10">
            {securityPoints.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="gpu-accelerate-child flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FF6600]/25 bg-[#FF6600]/[0.08] text-[#FF9900]">
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white sm:text-base">
                    {title}
                  </h3>
                  <p className="mt-1 max-w-lg text-sm leading-6 text-white/55">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-y border-white/[0.08] bg-[linear-gradient(115deg,rgba(255,102,0,0.12),rgba(26,26,26,0.9)_48%,rgba(255,153,0,0.08))]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:px-16 lg:py-24">
          <div ref={ctaRef} className="gpu-accelerate max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF9900] sm:text-sm">
              Sua próxima história começa agora
            </p>
            <h2 className="text-[clamp(2.35rem,4.7vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white">
              Encontre sua arte.
              <span className="block text-white/50">Faça parte do TattooGo.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
              Baixe o aplicativo e descubra uma nova forma de conectar ideias
              aos artistas certos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-store-button gpu-accelerate group flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white px-5 text-[#121212] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#FF6600] hover:shadow-[0_14px_42px_rgba(255,102,0,0.25)]"
            >
              <Apple aria-hidden="true" className="h-7 w-7 shrink-0" />
              <span className="flex flex-col text-left">
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-black/55">
                  Baixar na
                </span>
                <span className="text-base font-semibold leading-tight">
                  App Store
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="ml-2 h-4 w-4 opacity-45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>

            <a
              href="https://play.google.com/store/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-store-button gpu-accelerate group flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-[#1A1A1A] px-5 text-white transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#FF6600] hover:shadow-[0_14px_42px_rgba(255,102,0,0.22)]"
            >
              <Play
                aria-hidden="true"
                className="h-7 w-7 shrink-0 fill-[#FF6600] text-[#FF6600]"
              />
              <span className="flex flex-col text-left">
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-white/55">
                  Disponível no
                </span>
                <span className="text-base font-semibold leading-tight">
                  Google Play
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="ml-2 h-4 w-4 text-[#FF9900] opacity-45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-[#121212]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-8 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
          <a
            href="#top"
            className="gpu-accelerate-child inline-flex w-fit flex-col rounded-sm text-white transition-colors duration-200 hover:text-[#FF9900] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6600]"
            aria-label="TattooGo MK - voltar ao início"
          >
            <span className="text-lg font-semibold tracking-[-0.04em]">
              TattooGo <span className="text-[#FF6600]">MK</span>
            </span>
            <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/45">
              by Gafisx Labs
            </span>
          </a>

          <nav aria-label="Links institucionais">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
              <li>
                <a className="footer-nav-link" href="#top">
                  Início
                </a>
              </li>
              <li>
                <a className="footer-nav-link" href="#clients-title">
                  Para clientes
                </a>
              </li>
              <li>
                <a className="footer-nav-link" href="#artists-title">
                  Para tatuadores
                </a>
              </li>
              <li>
                <a className="footer-nav-link" href="#security">
                  Segurança
                </a>
              </li>
            </ul>
          </nav>

          <p className="text-xs leading-5 text-white/40 md:text-right">
            © {new Date().getFullYear()} Gafisx Labs. TattooGo MK.
            <span className="block">Arte conectada com confiança.</span>
          </p>
        </div>
      </footer>
    </section>
  );
}
