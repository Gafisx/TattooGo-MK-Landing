/**
 * Motor puro de decisão da visibilidade da barra superior (estilo Instagram).
 *
 * Toda a regra de intenção (zona morta, velocidade, deslocamento mínimo) e as
 * travas de segurança vivem aqui, sem dependência de DOM/React, para que possam
 * ser cobertas por testes unitários determinísticos. O componente `AppleTopBar`
 * apenas alimenta este motor com `scrollY`, tempo e travas e aplica o resultado.
 */

export type TopBarScrollLocks = {
  readonly nearTop: boolean;
  readonly actionSheetOpen: boolean;
  readonly menuOpen: boolean;
  readonly focusWithin: boolean;
  readonly programmaticScroll: boolean;
};

export const TOP_BAR_SCROLL_ENGINE = {
  /** Distância do topo abaixo da qual a barra é sempre exibida. */
  topThreshold: 8,
  /** Deslocamento acumulado mínimo (px) para considerar intenção. */
  minDelta: 12,
  /** Velocidade mínima (px/ms) para considerar gesto intencional. */
  minVelocity: 0.04,
  /** Deslocamento acumulado que força ação mesmo em rolagem lenta. */
  forceDelta: 48,
} as const;

export type TopBarScrollDecisionInput = {
  readonly currentVisible: boolean;
  readonly prevScrollY: number;
  readonly currentScrollY: number;
  readonly accumulatedDelta: number;
  readonly lastTime: number;
  readonly now: number;
  readonly locks: TopBarScrollLocks;
};

export type TopBarScrollDecision = {
  readonly visible: boolean;
  readonly accumulatedDelta: number;
  readonly lastTime: number;
  readonly changed: boolean;
};

/**
 * Calcula a próxima visibilidade da barra. Nunca altera `scrollY`; apenas
 * devolve a intenção de exibir/ocultar e o acumulador atualizado.
 */
export function decideTopBarVisibility(
  input: TopBarScrollDecisionInput,
): TopBarScrollDecision {
  const {
    currentVisible,
    prevScrollY,
    currentScrollY,
    accumulatedDelta,
    lastTime,
    now,
    locks,
  } = input;

  // Travas de segurança forçam exibição imediata.
  if (
    locks.nearTop ||
    locks.actionSheetOpen ||
    locks.menuOpen ||
    locks.focusWithin ||
    locks.programmaticScroll
  ) {
    return {
      visible: true,
      accumulatedDelta: 0,
      lastTime: now,
      changed: currentVisible !== true,
    };
  }

  const delta = currentScrollY - prevScrollY;
  const dt = Math.max(1, now - lastTime);
  const velocity = Math.abs(delta) / dt;

  // Reset do acumulador ao inverter a direção.
  let accum = accumulatedDelta;
  if ((delta > 0 && accum < 0) || (delta < 0 && accum > 0)) {
    accum = 0;
  }
  accum += delta;

  // Zona morta: micro-movimentos não alteram nada.
  if (Math.abs(accum) < TOP_BAR_SCROLL_ENGINE.minDelta) {
    return {
      visible: currentVisible,
      accumulatedDelta: accum,
      lastTime: now,
      changed: false,
    };
  }

  // Filtro de velocidade: rolagem lenta só age se acumular deslocamento grande.
  if (
    velocity < TOP_BAR_SCROLL_ENGINE.minVelocity &&
    Math.abs(accum) < TOP_BAR_SCROLL_ENGINE.forceDelta
  ) {
    return {
      visible: currentVisible,
      accumulatedDelta: accum,
      lastTime: now,
      changed: false,
    };
  }

  // Intenção clara: descer recolhe, subir exibe.
  const nextVisible = accum > 0 ? false : accum < 0 ? true : currentVisible;

  return {
    visible: nextVisible,
    accumulatedDelta: 0,
    lastTime: now,
    changed: nextVisible !== currentVisible,
  };
}
