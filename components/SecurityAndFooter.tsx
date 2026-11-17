"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Apple,
  Check,
  Fingerprint,
  Play,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const securityPoints = [
  {
    icon: Fingerprint,
    title: "Criptografia ponta a ponta",
    description:
      "Proteção criptográfica acompanha a troca de informações sensíveis em cada etapa.",
    status: "E2E PROTECTED",
  },
  {
    icon: WalletCards,
    title: "Custódia acompanhada",
    description:
      "As condições e o status de cada reserva orientam as etapas até a liberação do saldo.",
    status: "RESERVATION-BASED",
  },
  {
    icon: ShieldCheck,
    title: "Split payments automatizados",
    description:
      "A divisão segue as condições apresentadas na reserva, com mais clareza para cliente e tatuador.",
    status: "AUTO SPLIT",
  },
  {
    icon: Check,
    title: "Perfis verificados",
    description:
      "Uma comunidade com mais confiança para encontrar, contratar e criar.",
    status: "TRUSTED PROFILES",
  },
];

export default function SecurityAndFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cleanupShieldTilt = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const shieldCard = shieldRef.current?.querySelector<HTMLElement>(
      "[data-shield-card]",
    );
    const shieldAura = shieldRef.current?.querySelector<HTMLElement>(
      "[data-shield-aura]",
    );
    const shieldReveal = shieldRef.current?.querySelector<HTMLElement>(
      "[data-shield-reveal]",
    );

    const context = gsap.context(() => {
      [
        shieldRef.current,
        shieldCard,
        shieldAura,
        shieldReveal,
        copyRef.current,
        ctaRef.current,
      ].forEach((element) => {
        if (element) {
          gsap.set(element, {
            force3D: true,
            willChange: "transform, opacity",
          });
        }
      });

      if (shieldAura) {
        gsap.fromTo(
          shieldAura,
          { scale: 0.78, autoAlpha: 0.2, y: 18 },
          {
            scale: 1.08,
            autoAlpha: 0.9,
            y: -8,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              end: "top 28%",
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (shieldReveal) {
        gsap.set(shieldReveal, {
          scaleY: 1,
          transformOrigin: "bottom center",
        });
        gsap.to(shieldReveal, {
          scaleY: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            end: "top 34%",
            scrub: 0.85,
            invalidateOnRefresh: true,
          },
        });
      }

      if (
        shieldCard &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) {
        const rotateX = gsap.quickTo(shieldCard, "rotationX", {
          duration: 0.55,
          ease: "power3.out",
          force3D: true,
        });
        const rotateY = gsap.quickTo(shieldCard, "rotationY", {
          duration: 0.55,
          ease: "power3.out",
          force3D: true,
        });
        const handlePointerMove = (event: PointerEvent) => {
          const bounds = shieldCard.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          rotateX(y * -5);
          rotateY(x * 7);
        };
        const resetTilt = () => {
          rotateX(0);
          rotateY(0);
        };

        shieldCard.addEventListener("pointermove", handlePointerMove, {
          passive: true,
        });
        shieldCard.addEventListener("pointerleave", resetTilt, {
          passive: true,
        });
        cleanupShieldTilt.current = () => {
          shieldCard.removeEventListener("pointermove", handlePointerMove);
          shieldCard.removeEventListener("pointerleave", resetTilt);
        };
      }

      const securityItems =
        copyRef.current?.querySelectorAll<HTMLElement>("[data-security-point]");
      if (securityItems?.length) {
        gsap.set(securityItems, {
          force3D: true,
          willChange: "transform, opacity",
        });
        gsap.fromTo(
          securityItems,
          { x: -14, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            ease: "power2.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: copyRef.current,
              start: "top 68%",
              end: "top 25%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );
      }

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

    return () => {
      cleanupShieldTilt.current?.();
      cleanupShieldTilt.current = null;
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      className="relative isolate overflow-hidden bg-[#121212] pt-24 sm:pt-32 lg:pt-40"
      aria-labelledby="security-title"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_24%,rgba(255,102,0,0.14),transparent_30%),radial-gradient(ellipse_at_14%_66%,rgba(255,153,0,0.08),transparent_30%),radial-gradient(ellipse_at_50%_70%,rgba(0,255,102,0.05),transparent_36%),radial-gradient(ellipse_at_92%_55%,rgba(73,119,255,0.06),transparent_30%)]" />

      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-24 sm:px-10 sm:pb-32 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-16 lg:pb-40">
        <div
          ref={shieldRef}
          className="gpu-accelerate relative mx-auto aspect-square w-full max-w-[620px] [perspective:1200px]"
        >
          <div
            data-shield-aura
            aria-hidden="true"
            className="gpu-accelerate pointer-events-none absolute inset-[5%] rounded-[2.5rem] bg-gradient-to-br from-[#FF6600]/30 via-[#FF9900]/10 to-[#00FF66]/30 opacity-60 blur-[75px]"
          />
          <div
            data-shield-card
            className="gpu-accelerate-child absolute inset-[8%] isolate overflow-hidden rounded-[2.5rem] border border-white/20 bg-[#1A1A1A]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl [transform-style:preserve-3d]"
          >
            <div className="pointer-events-none absolute -left-[12%] top-[8%] h-[55%] w-[65%] rounded-full bg-[#FF6600]/15 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-[14%] right-[-8%] h-[58%] w-[62%] rounded-full bg-[#00FF66]/10 blur-[90px]" />
            <div className="pointer-events-none absolute right-[8%] top-[12%] h-[36%] w-[42%] rounded-full bg-[#4977FF]/[0.09] blur-[70px]" />
            <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-transparent to-[#00FF66]/[0.03]" />

            <Image
              src="/assets/images/security-split-payments-shield.png"
              alt="Escudo TattooGo MK simbolizando a proteção dos pagamentos entre cliente e tatuador"
              fill
              sizes="(max-width: 1024px) 90vw, 48vw"
              className="gpu-accelerate object-contain p-[5%] [transform:translate3d(0,0,24px)]"
            />

            <div
              data-shield-reveal
              aria-hidden="true"
              className="gpu-accelerate-child pointer-events-none absolute inset-3 z-[1] rounded-[2rem] bg-[linear-gradient(160deg,rgba(18,18,18,0.92)_0%,rgba(255,102,0,0.2)_42%,rgba(0,255,102,0.22)_100%)] motion-reduce:scale-y-0"
            />

            <div className="gpu-accelerate-child absolute left-7 top-7 z-10 rounded-xl border border-white/10 bg-[#121212]/65 px-3 py-2 backdrop-blur-lg [transform:translate3d(0,0,48px)]">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#00FF66]">
                Secure enclave
              </p>
              <p className="mt-1 text-[11px] text-white/65">
                Reserva protegida
              </p>
            </div>
          </div>
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
            <span className="block bg-gradient-to-r from-[#FF9900] via-[#FF6600] to-[#00FF66] bg-clip-text text-transparent">
              o valor da sua arte.
            </span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
            Criptografia avançada protege os dados e as etapas de pagamento.
            Com regras claras de split e liberação de saldo vinculada à reserva,
            clientes e artistas podem focar no que importa: a arte.
          </p>

          <ul className="mt-8 space-y-5 sm:mt-10">
            {securityPoints.map(
              ({ icon: Icon, title, description, status }) => (
              <li
                key={title}
                data-security-point
                className="flex items-start gap-4"
              >
                <span className="gpu-accelerate-child flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00FF66]/20 bg-[#00FF66]/[0.06] text-[#FF9900]">
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-sm font-semibold text-white sm:text-base">
                      {title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#00FF66]/75">
                      <span className="h-1 w-1 rounded-full bg-[#00FF66] shadow-[0_0_7px_#00FF66]" />
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 max-w-lg text-sm leading-6 text-white/55">
                    {description}
                  </p>
                </div>
              </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="relative isolate overflow-hidden border-y border-white/[0.08] bg-[#171717]/90">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_50%,rgba(255,102,0,0.16),transparent_36%),radial-gradient(ellipse_at_86%_70%,rgba(0,255,102,0.09),transparent_34%),radial-gradient(ellipse_at_68%_0%,rgba(73,119,255,0.08),transparent_30%)]" />
        <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:px-16 lg:py-24">
          <div ref={ctaRef} className="gpu-accelerate max-w-3xl">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#FF9900] sm:text-sm">
              <span className="h-px w-9 bg-[#00FF66]" />
              Sua próxima história começa agora
            </p>
            <h2 className="text-[clamp(2.35rem,4.7vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white">
              Encontre sua arte.
              <span className="block bg-gradient-to-r from-[#FF6600] via-[#FF9900] to-[#00FF66] bg-clip-text text-transparent">
                Faça parte do TattooGo.
              </span>
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
              className="footer-store-button gpu-accelerate group relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-[#1A1A1A]/65 px-5 text-white backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#FF6600]/70 hover:shadow-[0_0_30px_rgba(255,102,0,0.18)] motion-reduce:transition-none"
            >
              <Apple
                aria-hidden="true"
                className="h-7 w-7 shrink-0 text-[#FF9900]"
              />
              <span className="flex flex-col text-left">
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.12em] text-white/55">
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
              className="footer-store-button gpu-accelerate group relative isolate flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-[#1A1A1A]/65 px-5 text-white backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#00FF66]/60 hover:shadow-[0_0_30px_rgba(0,255,102,0.16)] motion-reduce:transition-none"
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

      <footer className="relative bg-[#121212]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-8 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
          <a
            href="#top"
            className="gpu-accelerate-child inline-flex w-fit flex-col rounded-sm text-white transition-colors duration-200 hover:text-[#FF9900] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF6600]"
            aria-label="TattooGo MK - voltar ao início"
          >
            <span className="text-lg font-semibold tracking-[-0.04em]">
              <span className="bg-gradient-to-r from-[#FF6600] via-[#FF9900] to-[#00FF66] bg-clip-text text-transparent">
                TattooGo MK
              </span>
            </span>
            <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white/45">
              Engineered by Gafisx Labs
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
            <span className="block text-[#FF9900]/65">
              Arte conectada com confiança.
            </span>
          </p>
        </div>
      </footer>
      <div
        aria-hidden="true"
        className="h-px bg-gradient-to-r from-transparent via-[#FF6600] to-[#00FF66] shadow-[0_0_18px_rgba(0,255,102,0.35)]"
      />
    </section>
  );
}
