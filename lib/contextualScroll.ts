/**
 * Rolagem controlada para itens de navegação contextual.
 *
 * Regras de segurança (não negociáveis):
 *  - nunca briga com o usuário: `wheel`, `touchstart`, `keydown` e `mousedown`
 *    cancelam a animação no mesmo evento, antes de qualquer frame seguinte;
 *  - nunca interfere no `pin`/`scrub` do GSAP: apenas escreve `scrollY`, jamais
 *    toca em ScrollTrigger, `100dvh` ou na geometria das seções;
 *  - `prefers-reduced-motion` (ou ausência de `requestAnimationFrame`) salta
 *    direto para o destino, sem animação;
 *  - quando o Lenis está ativo, delegamos para ele (que já interrompe no input
 *    do usuário) e mantemos uma única fonte de rolagem.
 */

export type ScrollSmootherOptions = {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  force?: boolean;
  lock?: boolean;
};

export type ScrollSmoother = {
  scrollTo: (target: HTMLElement | number, options?: ScrollSmootherOptions) => void;
};

export type ScrollToSectionOptions = {
  offset?: number;
  duration?: number;
  reducedMotion?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
};

/** Altura de referência da barra (56px) + respiro visual. */
export const TOP_BAR_SCROLL_OFFSET = 72;

const DEFAULT_DURATION = 620;
const INTERRUPT_EVENTS = ["wheel", "touchstart", "keydown", "mousedown"] as const;

let smoother: ScrollSmoother | null = null;
let cancelActiveScroll: (() => void) | null = null;

/** Registrado pelo `SmoothScroll` (Lenis). Pode ser removido no unmount. */
export function registerScrollSmoother(instance: ScrollSmoother | null): void {
  smoother = instance;
}

export function getRegisteredScrollSmoother(): ScrollSmoother | null {
  return smoother;
}

export function isContextualScrollActive(): boolean {
  return cancelActiveScroll !== null;
}

export function cancelActiveContextualScroll(): void {
  cancelActiveScroll?.();
}

const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

/**
 * Rola até a seção informada. Retorna `false` quando a seção não existe no
 * layout atual — o chamador decide o fallback (rota com hash, por exemplo).
 */
export function scrollToSection(
  sectionId: string,
  options: ScrollToSectionOptions = {},
): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const element = document.getElementById(sectionId);
  if (!element) return false;

  const offset = options.offset ?? TOP_BAR_SCROLL_OFFSET;
  const duration = options.duration ?? DEFAULT_DURATION;
  const reducedMotion = options.reducedMotion ?? false;
  const targetY = Math.max(
    0,
    Math.round(element.getBoundingClientRect().top + window.scrollY - offset),
  );

  // Qualquer rolagem programática anterior cede lugar a esta.
  cancelActiveContextualScroll();

  if (reducedMotion || duration <= 0) {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    options.onComplete?.();
    return true;
  }

  if (smoother) {
    smoother.scrollTo(targetY, {
      duration: duration / 1000,
      immediate: false,
      force: true,
      lock: false,
    });
    options.onComplete?.();
    return true;
  }

  if (typeof window.requestAnimationFrame !== "function") {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    options.onComplete?.();
    return true;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 1) {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    options.onComplete?.();
    return true;
  }

  let frameId = 0;
  let startedAt: number | null = null;
  let settled = false;

  const detach = () => {
    for (const eventName of INTERRUPT_EVENTS) {
      window.removeEventListener(eventName, cancel);
    }
    cancelActiveScroll = null;
  };

  const cancel = () => {
    if (settled) return;
    settled = true;
    if (frameId !== 0) window.cancelAnimationFrame(frameId);
    frameId = 0;
    detach();
    options.onCancel?.();
  };

  const step = (timestamp: number) => {
    if (settled) return;
    if (startedAt === null) startedAt = timestamp;
    const progress = Math.min(1, Math.max(0, (timestamp - startedAt) / duration));
    const eased = easeOutQuint(progress);
    window.scrollTo({ top: startY + distance * eased, left: 0, behavior: "auto" });

    if (progress < 1) {
      frameId = window.requestAnimationFrame(step);
      return;
    }

    settled = true;
    frameId = 0;
    detach();
    options.onComplete?.();
  };

  cancelActiveScroll = cancel;
  for (const eventName of INTERRUPT_EVENTS) {
    window.addEventListener(eventName, cancel, { passive: true });
  }
  frameId = window.requestAnimationFrame(step);
  return true;
}
