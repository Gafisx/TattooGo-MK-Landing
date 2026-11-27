"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronsLeftRight,
  Compass,
  Download,
  FileText,
  LifeBuoy,
  MessageSquare,
  PenTool,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { computeMenuLayout, type MenuLayout } from "@/lib/menuGeometry";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Cor de assinatura exata do ícone (tokens do TattooGo MK). */
  accent: string;
};

/**
 * Cada item aponta para uma rota ou seção que já existe no projeto:
 * - `/download` → rota do PWA;
 * - `#split-client-title` → jornadas cliente/tatuador (como funciona);
 * - `#security` → seção de segurança e confiança (ajuda);
 * - `#waitlist` → formulário real de captação (feedback);
 * - `#legal` → rodapé institucional (licença e informações legais).
 */
const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: "download",
    label: "Baixar App",
    href: "/download",
    icon: Download,
    accent: "#FF6600",
  },
  {
    id: "how-it-works",
    label: "Como Funciona",
    href: "/#split-client-title",
    icon: Compass,
    accent: "#00FF66",
  },
  {
    id: "help",
    label: "Ajuda",
    href: "/#security",
    icon: LifeBuoy,
    accent: "#4977FF",
  },
  {
    id: "feedback",
    label: "Feedback",
    href: "/#waitlist",
    icon: MessageSquare,
    accent: "#FF9900",
  },
  {
    id: "terms",
    label: "Termos",
    href: "/#legal",
    icon: FileText,
    accent: "#8D43FF",
  },
];

/** Viewport usada antes da hidratação — mantém o primeiro render determinístico. */
const SSR_VIEWPORT = { width: 1440, height: 900 } as const;

type ViewportSize = { width: number; height: number };

function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(SSR_VIEWPORT);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      });
    };

    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("orientationchange", measure);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return size;
}

/** Converte os tokens de alpha em rgba para manter a cor exata de assinatura. */
function accentAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function TattooMenu() {
  // Guarda a rota em que o menu foi aberto; ao navegar, fecha sem useEffect nem ref no render.
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pathname = usePathname();
  const isOpen = openPathname === pathname;
  const reducedMotion = usePrefersReducedMotion();
  const viewport = useViewportSize();

  const layout: MenuLayout = useMemo(
    () =>
      computeMenuLayout(viewport.width, viewport.height, MENU_ITEMS.length),
    [viewport.width, viewport.height],
  );

  const closeMenu = useCallback(() => {
    setOpenPathname(null);
    setExpanded(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = itemRefs.current.filter(
          (el): el is HTMLAnchorElement => el !== null,
        );
        if (!items.length) return;
        e.preventDefault();
        const activeIndex = items.findIndex(
          (el) => el === document.activeElement,
        );
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const nextIndex =
          activeIndex === -1
            ? delta > 0
              ? 0
              : items.length - 1
            : (activeIndex + delta + items.length) % items.length;
        items[nextIndex]?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeMenu]);

  const panelStyle: CSSProperties = {
    width: expanded ? layout.maxWidth : layout.collapsedWidth,
    maxWidth: layout.maxWidth,
    maxHeight: layout.maxHeight,
    transformOrigin: "bottom right",
  };

  const shellStyle: CSSProperties = {
    right: `max(env(safe-area-inset-right, 0px), ${layout.gutter}px)`,
    bottom: `max(env(safe-area-inset-bottom, 0px), ${layout.gutter}px)`,
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex flex-col items-end gap-2 text-white"
      style={shellStyle}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="tattoo-quick-menu"
            role="menu"
            aria-label="Ações rápidas do TattooGo"
            data-expanded={expanded}
            initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 18, scale: 0.97 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 460, damping: 36, mass: 0.85 }
            }
            style={panelStyle}
            className="relative flex flex-col gap-1.5 overflow-y-auto overscroll-contain rounded-[1.75rem] border border-white/12 bg-[#121212]/85 p-1.5 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/5 backdrop-blur-2xl"
          >
            {/* Scrim tonalizado: garante contraste do texto sobre qualquer fundo. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.07] via-transparent to-black/25"
            />

            {MENU_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  href={item.href}
                  role="menuitem"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={closeMenu}
                  className="group relative flex h-11 shrink-0 items-center gap-3 rounded-full px-1 outline-none transition-colors duration-200 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    outlineColor: item.accent,
                    backgroundColor: isActive
                      ? accentAlpha(item.accent, 0.14)
                      : undefined,
                    boxShadow: isActive
                      ? `inset 0 0 0 1px ${accentAlpha(item.accent, 0.4)}`
                      : undefined,
                  }}
                >
                  <span
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-[#0B0B0B]/70"
                    style={{ borderColor: accentAlpha(item.accent, 0.38) }}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-[18px] w-[18px]"
                      strokeWidth={1.9}
                      style={{ color: item.accent }}
                    />
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: item.accent,
                          boxShadow: `0 0 8px ${accentAlpha(item.accent, 0.9)}`,
                        }}
                      />
                    )}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`overflow-hidden whitespace-nowrap text-sm font-semibold leading-none text-white/90 transition-[max-width,opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                      expanded
                        ? "max-w-[10rem] translate-x-0 pr-2 opacity-100"
                        : "max-w-0 -translate-x-1 opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {isOpen && (
            <motion.button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-controls="tattoo-quick-menu"
              aria-label={
                expanded
                  ? "Ocultar nomes das ações rápidas"
                  : "Mostrar nomes das ações rápidas"
              }
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 30 }
              }
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#121212]/78 text-white/85 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] outline-none backdrop-blur-2xl transition-colors duration-200 hover:bg-[#1A1A1A]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF9900]"
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
            >
              <ChevronsLeftRight
                aria-hidden="true"
                className={`h-5 w-5 transition-transform duration-300 motion-reduce:transition-none ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          ref={triggerRef}
          type="button"
          onClick={() =>
            setOpenPathname((prev) => {
              if (prev === pathname) {
                setExpanded(false);
                return null;
              }
              return pathname;
            })
          }
          aria-expanded={isOpen}
          aria-controls="tattoo-quick-menu"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          style={{ width: layout.triggerSize, height: layout.triggerSize }}
          className="group flex shrink-0 items-center justify-center rounded-full border border-white/14 bg-[#121212]/78 text-white shadow-[0_12px_36px_-10px_rgba(0,0,0,0.85)] outline-none backdrop-blur-2xl transition-colors duration-200 hover:bg-[#1A1A1A]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6600]"
          whileTap={reducedMotion ? undefined : { scale: 0.92 }}
          animate={reducedMotion ? undefined : { rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isOpen ? (
            <X aria-hidden="true" className="h-6 w-6 text-[#FF6600]" />
          ) : (
            <PenTool
              aria-hidden="true"
              className="h-6 w-6 text-slate-200 transition-colors group-hover:text-[#00FF66]"
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
