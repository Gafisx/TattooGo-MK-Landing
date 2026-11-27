import { describe, expect, test } from "vitest";
import {
  TOP_BAR_ACCENTS,
  TOP_BAR_CONFIGS,
  TOP_BAR_ACTION_IDS,
  getTopBarConfig,
  isTopBarItemActive,
  normalizePathname,
  resolveTopBarContext,
  type TopBarActionItem,
  type TopBarAnchorItem,
  type TopBarContextKey,
  type TopBarItem,
} from "@/lib/topBarConfig";
import { TOP_BAR_ICONS } from "@/components/ui/topBarIcons";

const EXPECTED_LABELS: Record<TopBarContextKey, readonly string[]> = {
  landing: ["Clientes", "Tatuadores", "Download", "Ajuda", "Feedback"],
  download: ["Instalar", "Plataformas", "Lista VIP", "Ajuda", "Termos"],
  clientes: ["Explorar", "Estilos", "Mapa", "Orçamento", "Feedback"],
  tatuadores: ["Painel", "Agenda", "Portfólio", "Entrar / VIP", "Termos"],
  support: ["Feedback", "Ajuda", "Segurança", "Termos"],
};

const CONTEXT_BY_PATH: ReadonlyArray<readonly [string, TopBarContextKey]> = [
  ["/", "landing"],
  ["/download", "download"],
  ["/download/ios/", "download"],
  ["/clientes", "clientes"],
  ["/clientes/", "clientes"],
  ["/tatuadores", "tatuadores"],
  ["/tatuadores/perfil", "tatuadores"],
  ["/ajuda", "support"],
  ["/feedback", "support"],
  ["/termos", "support"],
  ["/seguranca/privacidade", "support"],
  ["/?utm=1#waitlist", "landing"],
  ["/rota-desconhecida", "landing"],
];

describe("resolveTopBarContext", () => {
  test.each(CONTEXT_BY_PATH)("resolves %s to %s", (pathname, expected) => {
    expect(resolveTopBarContext(pathname)).toBe(expected);
    expect(getTopBarConfig(pathname).context).toBe(expected);
  });

  test("normaliza hash, query e barra final", () => {
    expect(normalizePathname("/Clientes/")).toBe("/clientes");
    expect(normalizePathname("/#waitlist")).toBe("/");
    expect(normalizePathname("///")).toBe("/");
  });
});

describe("configuração por layout", () => {
  test.each(Object.keys(EXPECTED_LABELS) as TopBarContextKey[])(
    "layout %s expõe o conjunto próprio de itens",
    (context) => {
      const config = TOP_BAR_CONFIGS[context];
      expect(config.items.map((item) => item.label)).toEqual(EXPECTED_LABELS[context]);
      expect(new Set(config.items.map((item) => item.id)).size).toBe(config.items.length);
      expect(config.ariaLabel.length).toBeGreaterThan(0);
    },
  );

  test("cada item declara explicitamente o tipo de ação", () => {
    const allItems = Object.values(TOP_BAR_CONFIGS).flatMap((config) => config.items);

    for (const item of allItems) {
      expect(["route", "anchor", "action"]).toContain(item.kind);
      if (item.kind === "route") {
        expect(item.href.startsWith("/")).toBe(true);
      }
      if (item.kind === "anchor") {
        expect(item.sectionId.length).toBeGreaterThan(0);
      }
      if (item.kind === "action") {
        expect(item.actionId.length).toBeGreaterThan(0);
        expect(TOP_BAR_ACTION_IDS).toContain(item.actionId);
        expect(item.fallbackHref?.startsWith("/")).toBe(true);
      }
    }
  });

  test("todo ícone tipado tem implementação lucide", () => {
    const icons = Object.values(TOP_BAR_CONFIGS).flatMap((config) =>
      config.items.map((item) => item.icon),
    );
    for (const icon of icons) {
      expect(TOP_BAR_ICONS[icon]).toBeDefined();
      expect(typeof TOP_BAR_ICONS[icon]).not.toBe("string");
    }
  });

  test("acentuação contextual: verde só nos tatuadores", () => {
    expect(TOP_BAR_CONFIGS.tatuadores.accent).toBe("green");
    expect(TOP_BAR_ACCENTS.green).toBe("#00FF66");
    expect(TOP_BAR_CONFIGS.clientes.accent).toBe("orange");
    expect(TOP_BAR_ACCENTS.orange).toBe("#FF6600");
  });

  test("referencia apenas seções existentes na árvore", () => {
    const anchors = Object.values(TOP_BAR_CONFIGS)
      .flatMap((config) => config.items)
      .filter((item): item is TopBarAnchorItem => item.kind === "anchor")
      .map((item) => item.sectionId);

    expect(new Set(anchors)).toEqual(
      new Set(["security", "download-top", "clientes-top", "estilos", "artistas-top", "artist-features"]),
    );
  });

  test("ações de feedback existem em todos os layouts que as anunciam", () => {
    const feedbackItems = Object.values(TOP_BAR_CONFIGS)
      .flatMap((config) => config.items)
      .filter((item): item is TopBarActionItem => item.kind === "action" && item.actionId === "open-feedback");

    expect(feedbackItems).toHaveLength(3);
    expect(feedbackItems.every((item) => item.fallbackHref === "/#waitlist")).toBe(true);
  });
});

describe("isTopBarItemActive", () => {
  const landingItems: readonly TopBarItem[] = TOP_BAR_CONFIGS.landing.items;
  const clentesRoute = landingItems.find((item) => item.id === "clientes");
  const ajudaAnchor = landingItems.find((item) => item.id === "ajuda");
  const feedbackAction = landingItems.find((item) => item.id === "feedback");

  test("rota ativa apenas no caminho correspondente", () => {
    expect(clentesRoute).toBeDefined();
    if (!clentesRoute) throw new Error("item ausente");
    expect(isTopBarItemActive(clentesRoute, "/clientes", null)).toBe(true);
    expect(isTopBarItemActive(clentesRoute, "/clientes/perfil", null)).toBe(true);
    expect(isTopBarItemActive(clentesRoute, "/", null)).toBe(false);
    expect(isTopBarItemActive(clentesRoute, "/tatuadores", null)).toBe(false);
  });

  test("âncora ativa apenas com a seção visível observada", () => {
    if (!ajudaAnchor) throw new Error("item ausente");
    expect(isTopBarItemActive(ajudaAnchor, "/", "security")).toBe(true);
    expect(isTopBarItemActive(ajudaAnchor, "/", "estilos")).toBe(false);
    expect(isTopBarItemActive(ajudaAnchor, "/", null)).toBe(false);
  });

  test("ações nunca ficam presas como ativas", () => {
    if (!feedbackAction) throw new Error("item ausente");
    expect(isTopBarItemActive(feedbackAction, "/", "security")).toBe(false);
    expect(isTopBarItemActive(feedbackAction, "/#waitlist", null)).toBe(false);
  });
});
