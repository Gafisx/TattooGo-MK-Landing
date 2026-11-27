/**
 * Geometria determinística do conjunto de vidro ancorado ao canto inferior
 * direito da landing. Todas as fórmulas que posicionam e limitam o conjunto
 * vivem aqui (e não espalhadas em classes mágicas), para que o mesmo cálculo
 * seja usado em runtime e coberto por teste unitário.
 *
 * Regras:
 * - `gutter` cresce com a viewport, mas nunca abaixo de 12px (320px) nem
 *   acima de 24px (desktop/ultrawide), sempre somado ao `safe-area-inset-*`
 *   aplicado via CSS `env()` no componente.
 * - `maxWidth` nunca ultrapassa `viewportWidth - 2 * gutter`, então não há
 *   overflow horizontal nem em 320px.
 * - `maxHeight` reserva o gatilho, o gutter inferior, o respiro de borda e uma
 *   margem de topo, impedindo que o conjunto bata no topo em telas curtas
 *   (844×390 em paisagem).
 */

export const MENU_GEOMETRY = {
  /** Respiro lateral/inferior mínimo, em px (alinhado a `clamp(0.75rem,3vw,1.5rem)`). */
  gutterMin: 12,
  /** Fração da viewport usada como respiro antes do clamp. */
  gutterRatio: 0.03,
  /** Respiro máximo, em px. */
  gutterMax: 24,
  /** Gatilho (máquina de tatuar) em telas estreitas. */
  triggerCompact: 56,
  /** Gatilho a partir de 640px. */
  triggerComfortable: 64,
  /** Largura a partir da qual o gatilho usa o tamanho confortável. */
  triggerBreakpoint: 640,
  /** Altura de cada item — alvo de toque mínimo recomendado. */
  itemSize: 44,
  /** Espaço entre itens e entre o painel e o gatilho. */
  itemGap: 6,
  /** Padding interno do painel de vidro. */
  panelPadding: 6,
  /** Largura máxima do painel com os nomes expandidos. */
  panelMaxWidth: 264,
  /** Respiro entre o painel e a borda direita/inferior da viewport. */
  edgeSafety: 8,
  /** Margem de topo que o painel nunca invade. */
  topSafety: 16,
  /** Altura mínima aceitável do painel (um item). */
  panelMinHeight: 44,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeViewport(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Respiro lateral/inferior: `clamp(12, viewportWidth * 3%, 24)`. */
export function menuGutter(viewportWidth: number): number {
  const width = safeViewport(viewportWidth);
  return clamp(
    width * MENU_GEOMETRY.gutterRatio,
    MENU_GEOMETRY.gutterMin,
    MENU_GEOMETRY.gutterMax,
  );
}

/** Tamanho do gatilho: 56px abaixo de 640px, 64px a partir daí. */
export function menuTriggerSize(viewportWidth: number): number {
  return safeViewport(viewportWidth) >= MENU_GEOMETRY.triggerBreakpoint
    ? MENU_GEOMETRY.triggerComfortable
    : MENU_GEOMETRY.triggerCompact;
}

/** Largura do painel recolhido: um item mais o padding interno (56px). */
export function menuPanelCollapsedWidth(): number {
  return MENU_GEOMETRY.itemSize + MENU_GEOMETRY.panelPadding * 2;
}

/** Largura máxima do painel: `min(264, viewportWidth - 2 * gutter)`. */
export function menuPanelMaxWidth(viewportWidth: number): number {
  const width = safeViewport(viewportWidth);
  const available = width - menuGutter(width) * 2;
  return Math.max(
    MENU_GEOMETRY.itemSize,
    Math.min(MENU_GEOMETRY.panelMaxWidth, available),
  );
}

/** Altura ocupada pelos itens mais os espaçamentos internos. */
export function menuPanelContentHeight(itemCount: number): number {
  const count = Math.max(0, Math.floor(itemCount));
  if (count === 0) return 0;
  return (
    count * MENU_GEOMETRY.itemSize +
    (count - 1) * MENU_GEOMETRY.itemGap +
    MENU_GEOMETRY.panelPadding * 2
  );
}

/** Altura máxima do painel sem invadir o topo da viewport. */
export function menuPanelMaxHeight(
  viewportHeight: number,
  viewportWidth: number,
): number {
  const height = safeViewport(viewportHeight);
  const width = safeViewport(viewportWidth);
  const reserve =
    menuGutter(width) +
    menuTriggerSize(width) +
    MENU_GEOMETRY.itemGap +
    MENU_GEOMETRY.edgeSafety;

  return Math.max(
    MENU_GEOMETRY.panelMinHeight,
    height - reserve - MENU_GEOMETRY.topSafety,
  );
}

export type MenuLayout = {
  /** Respiro lateral/inferior aplicado ao conjunto. */
  gutter: number;
  /** Lado do gatilho da máquina. */
  triggerSize: number;
  /** Largura máxima do painel (recolhido ou com nomes). */
  maxWidth: number;
  /** Largura do painel com os ícones apenas. */
  collapsedWidth: number;
  /** Altura máxima do painel na viewport atual. */
  maxHeight: number;
  /** Altura real dos itens na viewport atual. */
  contentHeight: number;
  /** `true` quando os itens cabem sem rolagem interna. */
  fitsWithoutScroll: boolean;
};

/** Cálculo completo usado pelo componente em cada mudança de viewport. */
export function computeMenuLayout(
  viewportWidth: number,
  viewportHeight: number,
  itemCount: number,
): MenuLayout {
  const contentHeight = menuPanelContentHeight(itemCount);
  const maxHeight = menuPanelMaxHeight(viewportHeight, viewportWidth);

  return {
    gutter: menuGutter(viewportWidth),
    triggerSize: menuTriggerSize(viewportWidth),
    maxWidth: menuPanelMaxWidth(viewportWidth),
    collapsedWidth: menuPanelCollapsedWidth(),
    maxHeight,
    contentHeight,
    fitsWithoutScroll: contentHeight <= maxHeight,
  };
}
