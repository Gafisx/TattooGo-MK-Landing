"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  TOP_BAR_ACCENTS,
  getTopBarConfig,
  isTopBarItemActive,
  type TopBarActionItem,
  type TopBarAnchorItem,
  type TopBarContextKey,
  type TopBarItem,
} from "@/lib/topBarConfig";
import { TOP_BAR_SCROLL_OFFSET, isContextualScrollActive, scrollToSection } from "@/lib/contextualScroll";
import {
  TOP_BAR_SCROLL_ENGINE,
  decideTopBarVisibility,
  type TopBarScrollLocks,
} from "@/lib/topBarScrollEngine";
import { useTopBarActionState } from "@/lib/topBarActionStore";
import { TOP_BAR_PANEL_ID } from "@/lib/topBarActions";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { TOP_BAR_ICONS } from "./topBarIcons";
import TattooGoBrand from "./TattooGoBrand";

/** Evento consumido pelo Passo 2 (modais/gavetas/foco por layout). */
export const TOP_BAR_ACTION_EVENT = "tattoogo:topbar-action";

export type TopBarActionDetail = {
  readonly actionId: string;
  readonly context: TopBarContextKey;
};

declare global {
  interface WindowEventMap {
    "tattoogo:topbar-action": CustomEvent<TopBarActionDetail>;
  }
}

const WAITLIST_INPUT_ID = "waitlist-email";

type AccentStyle = CSSProperties & { "--tb-accent": string };

const isAnchorItem = (item: TopBarItem): item is TopBarAnchorItem =>
  item.kind === "anchor";

/**
 * Barra superior translúcida inspirada na galeria do iOS.
 *
 * Estado visual invertido: item inativo mostra ícone + rótulo curto; o item
 * ativo recolhe o rótulo (opacity/transform/clip-path) e deixa só o ícone em
 * destaque, com a cor contextual do TattooGo MK. A altura da barra é fixa e ela
 * é `position: fixed`, então o conteúdo da página nunca é empurrado.
 */
export default function AppleTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();

  const config = useMemo(() => getTopBarConfig(pathname), [pathname]);
  const anchorIds = useMemo(
    () => config.items.filter(isAnchorItem).map((item) => item.sectionId),
    [config],
  );

  // Guardamos a rota junto da seção para que a troca de layout nunca herde um
  // destaque antigo sem precisar de setState dentro de efeito.
  const openAction = useTopBarActionState();

  const [activeSection, setActiveSection] = useState<{
    pathname: string;
    sectionId: string | null;
  }>({ pathname, sectionId: null });
  const activeSectionId =
    activeSection.pathname === pathname ? activeSection.sectionId : null;

  // Motor de recolhimento/retorno da barra no scroll (estilo Instagram).
  const headerRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(true);
  const prevScrollYRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);
  const lastTimeRef = useRef(0);

  const applyVisibility = useCallback((visible: boolean) => {
    visibleRef.current = visible;
    const header = headerRef.current;
    if (!header) return;
    header.style.transform = visible
      ? "translate3d(0, 0, 0)"
      : "translate3d(0, -100%, 0)";
    header.dataset.topbarVisible = visible ? "true" : "false";
    header.classList.toggle("tattoo-topbar--hidden", !visible);
  }, []);

  const isMenuOpen = useCallback(() => {
    if (typeof document === "undefined") return false;
    const trigger = document.querySelector(
      '[aria-controls="tattoo-quick-menu"][aria-expanded="true"]',
    );
    return trigger !== null || document.getElementById("tattoo-quick-menu") !== null;
  }, []);

  const computeLocks = useCallback((): TopBarScrollLocks => {
    const header = headerRef.current;
    const scrollY =
      typeof window !== "undefined" ? window.scrollY : 0;
    return {
      nearTop: scrollY <= TOP_BAR_SCROLL_ENGINE.topThreshold,
      actionSheetOpen: openAction !== null,
      menuOpen: isMenuOpen(),
      focusWithin: header !== null && header.contains(document.activeElement),
      programmaticScroll: isContextualScrollActive(),
    };
  }, [openAction, isMenuOpen]);

  const recompute = useCallback(() => {
    if (typeof window === "undefined") return;
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const currentScrollY = window.scrollY;
    const decision = decideTopBarVisibility({
      currentVisible: visibleRef.current,
      prevScrollY: prevScrollYRef.current,
      currentScrollY,
      accumulatedDelta: accumulatedDeltaRef.current,
      lastTime: lastTimeRef.current || now,
      now,
      locks: computeLocks(),
    });
    prevScrollYRef.current = currentScrollY;
    accumulatedDeltaRef.current = decision.accumulatedDelta;
    lastTimeRef.current = decision.lastTime;
    applyVisibility(decision.visible);
  }, [applyVisibility, computeLocks]);

  const handleScroll = useCallback(() => {
    // Aplicação síncrona e leve: apenas leitura de scrollY + escrita de
    // transform (GPU), sem layout thrashing. O rAF é usado para coalescer
    // recomputações disparadas por foco/clique.
    recompute();
  }, [recompute]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const elements = anchorIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    // Observador passivo: apenas leitura de geometria no callback, sem loop de
    // scroll e sem disparar rolagem.
    const observer = new IntersectionObserver(
      (entries) => {
        let next: { id: string; distance: number } | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (!id) continue;
          const distance = Math.abs(
            entry.boundingClientRect.top - TOP_BAR_SCROLL_OFFSET,
          );
          if (!next || distance < next.distance) next = { id, distance };
        }

        if (!next) return;
        const { id } = next;
        setActiveSection((current) =>
          current.pathname === pathname && current.sectionId === id
            ? current
            : { pathname, sectionId: id },
        );
      },
      {
        rootMargin: `-${TOP_BAR_SCROLL_OFFSET + 4}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.4],
      },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [anchorIds, pathname]);

  const handleAnchor = useCallback(
    (item: TopBarAnchorItem) => {
      const moved = scrollToSection(item.sectionId, {
        offset: TOP_BAR_SCROLL_OFFSET,
        reducedMotion,
      });

      if (moved) {
        setActiveSection({ pathname, sectionId: item.sectionId });
        return;
      }

      // Âncora de outro layout (contexto de suporte/legal): navega com hash.
      router.push(`/#${item.sectionId}`);
    },
    [pathname, reducedMotion, router],
  );

  const handleAction = useCallback(
    (item: TopBarActionItem) => {
      // Evento cancelável: a camada de ações (`TopBarActionSheet`) chama
      // `preventDefault()` quando abre um painel real. Sem camada montada, o
      // fallback determinístico abaixo continua valendo.
      const event = new CustomEvent<TopBarActionDetail>(TOP_BAR_ACTION_EVENT, {
        detail: { actionId: item.actionId, context: config.context },
        cancelable: true,
      });
      const handled = !window.dispatchEvent(event);
      if (handled) return;

      if (item.actionId === "open-feedback") {
        const waitlistInput = document.getElementById(WAITLIST_INPUT_ID);
        if (waitlistInput instanceof HTMLElement) {
          waitlistInput.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "center",
          });
          waitlistInput.focus({ preventScroll: true });
          return;
        }
      }

      if (item.fallbackHref) router.push(item.fallbackHref);
    },
    [config.context, reducedMotion, router],
  );

  // Evita que Enter/Espaço "vazem" para o scroll global em itens de ação.
  const stopActivationKeys = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === " " || event.key === "Enter") event.stopPropagation();
  }, []);

  // Reset do estado de visibilidade a cada mudança de rota/layout.
  useEffect(() => {
    visibleRef.current = true;
    accumulatedDeltaRef.current = 0;
    prevScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
    lastTimeRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    applyVisibility(true);
  }, [pathname, applyVisibility]);

  // Listeners globais: scroll, foco e cliques (para detectar abertura do TattooMenu).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => handleScroll();
    const onFocusIn = () => recompute();
    const onClick = () => {
      // Deixa o TattooMenu atualizar aria-expanded antes de recomputar.
      window.requestAnimationFrame(() => recompute());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("click", onClick, true);

    // Estado inicial.
    recompute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("click", onClick, true);
    };
  }, [handleScroll, recompute]);

  // Reage à abertura/fechamento do TopBarActionSheet (store) e reduced-motion.
  useEffect(() => {
    recompute();
  }, [openAction, reducedMotion, recompute]);

  const style: AccentStyle = { "--tb-accent": TOP_BAR_ACCENTS[config.accent] };

  return (
    <header
      ref={headerRef}
      className="tattoo-topbar fixed inset-x-0 top-0 z-[60] w-full"
      style={style}
      data-topbar-context={config.context}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          aria-label="TattooGo MK — ir para a página inicial"
          className="group flex shrink-0 items-center rounded-full px-1 py-1 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-accent)]"
        >
          {/* Mesma assinatura da logo da Home, apenas escalada para a barra. */}
          <TattooGoBrand size="xs" decorative />
        </Link>

        <nav aria-label={config.ariaLabel} className="min-w-0 flex-1">
          <ul className="flex w-full items-center justify-end gap-0.5 sm:gap-1">
            {config.items.map((item) => {
              const Icon = TOP_BAR_ICONS[item.icon];
              const isActive = isTopBarItemActive(item, pathname, activeSectionId);
              const isExpanded =
                item.kind === "action" &&
                openAction?.actionId === item.actionId &&
                openAction.context === config.context;

              const itemClassName = [
                "tattoo-topbar__item group relative flex h-9 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 text-[11px] font-semibold tracking-tight sm:px-3 sm:text-xs",
                "transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-accent)]",
                isActive
                  ? "tattoo-topbar__item--active"
                  : "border-white/10 bg-white/[0.045] text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white",
              ].join(" ");

              const content = (
                <>
                  <span className="tattoo-topbar__icon flex shrink-0 items-center justify-center transition-transform duration-300 ease-out">
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4"
                      strokeWidth={1.9}
                    />
                  </span>
                  <span
                    aria-hidden="true"
                    className="tattoo-topbar__label whitespace-nowrap"
                  >
                    {item.label}
                  </span>
                </>
              );

              return (
                <li key={item.id} className="tattoo-topbar__cell flex min-w-0">
                  {item.kind === "route" ? (
                    <Link
                      href={item.href}
                      transitionTypes={[item.transition]}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                      data-state={isActive ? "active" : "idle"}
                      className={itemClassName}
                    >
                      {content}
                    </Link>
                  ) : item.kind === "anchor" ? (
                    <button
                      type="button"
                      onClick={() => handleAnchor(item)}
                      onKeyDown={stopActivationKeys}
                      aria-label={item.label}
                      aria-current={isActive ? "location" : undefined}
                      data-state={isActive ? "active" : "idle"}
                      className={itemClassName}
                    >
                      {content}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAction(item)}
                      onKeyDown={stopActivationKeys}
                      aria-label={item.label}
                      data-state={isActive ? "active" : "idle"}
                      aria-haspopup="dialog"
                      aria-expanded={isExpanded}
                      aria-controls={isExpanded ? TOP_BAR_PANEL_ID : undefined}
                      className={itemClassName}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
