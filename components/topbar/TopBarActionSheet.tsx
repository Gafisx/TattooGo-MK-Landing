"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { ChevronDown, X } from "lucide-react";
import { TOP_BAR_ACTION_EVENT, type TopBarActionDetail } from "@/components/ui/AppleTopBar";
import {
  TOP_BAR_PANEL_ACCENT_COLORS,
  TOP_BAR_PANEL_ID,
  TOP_BAR_PANEL_TITLE_ID,
  resolveTopBarPanel,
  type TopBarPanel,
} from "@/lib/topBarActions";
import type { TopBarContextKey } from "@/lib/topBarConfig";
import {
  closeTopBarAction,
  openTopBarAction,
  useTopBarActionState,
} from "@/lib/topBarActionStore";
import { getRegisteredScrollSmoother } from "@/lib/contextualScroll";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import TopBarActionForm from "./TopBarActionForm";

type PanelStyle = CSSProperties & { "--tb-panel-accent": string };

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function PanelBody({
  panel,
  context,
}: {
  panel: TopBarPanel;
  context: TopBarContextKey;
}) {
  const accentColor = TOP_BAR_PANEL_ACCENT_COLORS[panel.accent];

  if (panel.body.type === "feedback" || panel.body.type === "budget") {
    return (
      <TopBarActionForm
        kind={panel.body.type === "budget" ? "budget" : "feedback"}
        context={context}
        accentColor={accentColor}
        onDone={closeTopBarAction}
      />
    );
  }

  if (panel.body.type === "faq") {
    return (
      <ul className="flex flex-col gap-2">
        {panel.body.items.map((item) => (
          <li key={item.question}>
            <details className="group rounded-xl border border-white/10 bg-white/[0.035] transition-colors open:border-[color-mix(in_srgb,var(--tb-panel-accent)_45%,transparent)] hover:border-white/20">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-panel-accent)] [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-white/50 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-white/70">
                {item.answer}
              </p>
            </details>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {panel.body.items.map((item) => (
          <li
            key={item.title}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              {item.badge ? (
                <span className="rounded-full border border-[color-mix(in_srgb,var(--tb-panel-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--tb-panel-accent)_12%,transparent)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--tb-panel-accent)]">
                  {item.badge}
                </span>
              ) : null}
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/65">
              {item.description}
            </p>
          </li>
        ))}
      </ul>

      {panel.body.cta ? (
        <Link
          href={panel.body.cta.href}
          onClick={closeTopBarAction}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-[#121212] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ backgroundColor: accentColor }}
        >
          {panel.body.cta.label}
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Camada única de respostas da barra superior. Escuta o evento
 * `tattoogo:topbar-action`, abre o painel correspondente ao `actionId` e
 * cancela o evento (`preventDefault`) para que a barra não aplique o fallback.
 *
 * Fechamento por Escape, clique no backdrop e botão explícito; foco é preso no
 * diálogo e devolvido ao gatilho. A rolagem é congelada sem alterar `scrollY`
 * (compensação de scrollbar + pausa do Lenis, quando presente).
 */
export default function TopBarActionSheet() {
  const state = useTopBarActionState();
  const reducedMotion = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const panel = state ? resolveTopBarPanel(state.actionId, state.context) : null;
  const isOpen = panel !== null;
  const panelContext: TopBarContextKey = state?.context ?? "landing";

  const close = useCallback(() => {
    closeTopBarAction();
  }, []);

  // Registro do listener do evento global, uma única vez.
  useEffect(() => {
    const handleAction = (event: CustomEvent<TopBarActionDetail>) => {
      const resolved = resolveTopBarPanel(event.detail.actionId, event.detail.context);
      if (!resolved) return;
      event.preventDefault();
      openTopBarAction(resolved.id, event.detail.context);
    };

    window.addEventListener(TOP_BAR_ACTION_EVENT, handleAction);
    return () => window.removeEventListener(TOP_BAR_ACTION_EVENT, handleAction);
  }, []);

  // Foco, Escape, Tab trap e congelamento de rolagem enquanto aberto.
  useEffect(() => {
    if (!isOpen) return;

    const active = document.activeElement;
    previousFocusRef.current = active instanceof HTMLElement ? active : null;

    const smoother = getRegisteredScrollSmoother();
    smoother?.stop?.();

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // `overflow: hidden` mantém `scrollY` intacto; o padding evita salto de
    // largura quando existe barra de rolagem clássica.
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    panelRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const root = panelRef.current;
      if (!root) return;

      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusables.length === 0) {
        event.preventDefault();
        root.focus({ preventScroll: true });
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === root)) {
        event.preventDefault();
        last?.focus({ preventScroll: true });
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      smoother?.start?.();
      previousFocusRef.current?.focus({ preventScroll: true });
      previousFocusRef.current = null;
    };
  }, [isOpen, close]);

  const accentColor = panel
    ? TOP_BAR_PANEL_ACCENT_COLORS[panel.accent]
    : TOP_BAR_PANEL_ACCENT_COLORS.orange;
  const panelStyle: PanelStyle = { "--tb-panel-accent": accentColor };

  return (
    <AnimatePresence>
      {isOpen && panel ? (
        <motion.div
          key="topbar-action-layer"
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
          data-topbar-action-layer=""
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#050506]/75 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          />

          <motion.div
            ref={panelRef}
            id={TOP_BAR_PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TOP_BAR_PANEL_TITLE_ID}
            tabIndex={-1}
            style={panelStyle}
            data-topbar-panel={panel.id}
            className="relative flex max-h-[min(90dvh,calc(100dvh-7.5rem),46rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/12 bg-[#121212]/[0.97] shadow-[0_-8px_60px_-20px_rgba(0,0,0,0.9)] outline-none backdrop-blur-2xl sm:rounded-3xl sm:border-white/15"
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 30 }
            }
          >
            <div className="flex items-start gap-4 border-b border-white/10 px-5 pb-4 pt-5 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--tb-panel-accent)]">
                  {panel.eyebrow}
                </p>
                <h2
                  id={TOP_BAR_PANEL_TITLE_ID}
                  className="mt-1.5 text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  {panel.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {panel.description}
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/70 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-panel-accent)]"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
            >
              <PanelBody panel={panel} context={panelContext} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
