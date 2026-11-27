import { describe, expect, test } from "vitest";
import {
  MENU_GEOMETRY,
  computeMenuLayout,
  menuGutter,
  menuPanelCollapsedWidth,
  menuPanelContentHeight,
  menuPanelMaxHeight,
  menuPanelMaxWidth,
  menuTriggerSize,
} from "@/lib/menuGeometry";

/** Tamanhos exigidos na verificação enterprise. */
const VIEWPORTS = [
  { name: "320×640 ultra-estreito", width: 320, height: 640 },
  { name: "390×844 mobile", width: 390, height: 844 },
  { name: "844×390 paisagem", width: 844, height: 390 },
  { name: "768×1024 tablet", width: 768, height: 1024 },
  { name: "1440×900 desktop", width: 1440, height: 900 },
  { name: "2560×1080 ultrawide", width: 2560, height: 1080 },
] as const;

describe("menuGutter", () => {
  test("nunca fica abaixo de 12px nem acima de 24px", () => {
    expect(menuGutter(320)).toBe(12);
    expect(menuGutter(390)).toBe(12);
    expect(menuGutter(1440)).toBe(24);
    expect(menuGutter(2560)).toBe(24);
  });

  test("cresce proporcionalmente entre os limites", () => {
    expect(menuGutter(700)).toBeCloseTo(21, 5);
  });

  test("tolera viewport inválida sem gerar valores negativos", () => {
    expect(menuGutter(Number.NaN)).toBe(12);
    expect(menuGutter(-100)).toBe(12);
  });
});

describe("menuTriggerSize", () => {
  test("usa 56px em telas estreitas e 64px a partir de 640px", () => {
    expect(menuTriggerSize(320)).toBe(56);
    expect(menuTriggerSize(639)).toBe(56);
    expect(menuTriggerSize(640)).toBe(64);
    expect(menuTriggerSize(2560)).toBe(64);
  });
});

describe("menuPanelMaxWidth", () => {
  test.each(VIEWPORTS)("$name não estoura a largura da viewport", ({ width }) => {
    const maxWidth = menuPanelMaxWidth(width);
    expect(maxWidth + menuGutter(width) * 2).toBeLessThanOrEqual(width);
    expect(maxWidth).toBeLessThanOrEqual(MENU_GEOMETRY.panelMaxWidth);
  });

  test("em 320px ainda cabe o painel expandido", () => {
    expect(menuPanelMaxWidth(320)).toBeGreaterThan(MENU_GEOMETRY.itemSize * 4);
  });
});

describe("menuPanelCollapsedWidth / menuPanelContentHeight", () => {
  test("recolhido mede um item mais o padding (56px)", () => {
    expect(menuPanelCollapsedWidth()).toBe(56);
  });

  test("conteúdo de 5 itens soma itens, gaps e padding", () => {
    const expected =
      5 * MENU_GEOMETRY.itemSize +
      4 * MENU_GEOMETRY.itemGap +
      MENU_GEOMETRY.panelPadding * 2;
    expect(menuPanelContentHeight(5)).toBe(expected);
    expect(menuPanelContentHeight(0)).toBe(0);
  });
});

describe("menuPanelMaxHeight", () => {
  test.each(VIEWPORTS)("$name não invade o topo da tela", ({ width, height }) => {
    const maxHeight = menuPanelMaxHeight(height, width);
    const bottomReserve =
      menuGutter(width) +
      menuTriggerSize(width) +
      MENU_GEOMETRY.itemGap +
      MENU_GEOMETRY.edgeSafety;

    expect(maxHeight).toBeGreaterThanOrEqual(MENU_GEOMETRY.panelMinHeight);
    expect(maxHeight + bottomReserve + MENU_GEOMETRY.topSafety).toBeLessThanOrEqual(
      height,
    );
  });

  test("os 5 itens cabem sem rolagem em todos os tamanhos exigidos", () => {
    for (const { name, width, height } of VIEWPORTS) {
      const layout = computeMenuLayout(width, height, 5);
      expect(layout.fitsWithoutScroll, name).toBe(true);
    }
  });

  test("paisagem curta é o caso mais apertado, mas ainda cabe", () => {
    const layout = computeMenuLayout(844, 390, 5);
    expect(layout.maxHeight - layout.contentHeight).toBeGreaterThan(0);
  });
});

describe("computeMenuLayout", () => {
  test.each(VIEWPORTS)("$name devolve um layout coerente", ({ width, height }) => {
    const layout = computeMenuLayout(width, height, 5);

    expect(layout.gutter).toBe(menuGutter(width));
    expect(layout.triggerSize).toBe(menuTriggerSize(width));
    expect(layout.maxWidth).toBe(menuPanelMaxWidth(width));
    expect(layout.maxHeight).toBe(menuPanelMaxHeight(height, width));
    expect(layout.collapsedWidth).toBe(menuPanelCollapsedWidth());
    expect(layout.collapsedWidth).toBeLessThanOrEqual(layout.maxWidth);
    expect(layout.contentHeight).toBeGreaterThan(0);
  });
});
