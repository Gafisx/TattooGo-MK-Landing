import { describe, expect, test } from "vitest";
import {
  TOP_BAR_ACTION_IDS,
  TOP_BAR_CONFIGS,
  type TopBarContextKey,
} from "@/lib/topBarConfig";
import {
  getHelpFaq,
  isTopBarActionId,
  resolveTopBarPanel,
} from "@/lib/topBarActions";

const CONTEXTS = Object.keys(TOP_BAR_CONFIGS) as TopBarContextKey[];

describe("registro de respostas da barra superior", () => {
  test.each(TOP_BAR_ACTION_IDS)("ação %s tem painel real em todos os layouts", (actionId) => {
    for (const context of CONTEXTS) {
      const panel = resolveTopBarPanel(actionId, context);

      expect(panel).not.toBeNull();
      expect(panel?.id).toBe(actionId);
      expect(panel?.title.length).toBeGreaterThan(3);
      expect(panel?.eyebrow.length).toBeGreaterThan(2);
      expect(panel?.description.length).toBeGreaterThan(20);
      expect(["orange", "green"]).toContain(panel?.accent);
    }
  });

  test("toda actionId usada na configuração é resolvível", () => {
    const actionIds = Object.values(TOP_BAR_CONFIGS)
      .flatMap((config) => config.items)
      .flatMap((item) => (item.kind === "action" ? [item.actionId] : []));

    for (const actionId of actionIds) {
      expect(isTopBarActionId(actionId)).toBe(true);
      expect(resolveTopBarPanel(actionId, "landing")).not.toBeNull();
    }
  });

  test("ação desconhecida retorna null (fallback de rota assume)", () => {
    expect(resolveTopBarPanel("open-desconhecida", "landing")).toBeNull();
    expect(isTopBarActionId("open-desconhecida")).toBe(false);
  });

  test("feedback e orçamento renderizam formulários reais", () => {
    expect(resolveTopBarPanel("open-feedback", "landing")?.body.type).toBe("feedback");
    expect(resolveTopBarPanel("open-budget", "clientes")?.body.type).toBe("budget");
  });

  test("ajuda responde com FAQ específica do layout", () => {
    const faqByContext = CONTEXTS.map((context) => getHelpFaq(context));

    for (const faq of faqByContext) {
      expect(faq.length).toBeGreaterThanOrEqual(4);
      for (const item of faq) {
        expect(item.question.length).toBeGreaterThan(8);
        expect(item.answer.length).toBeGreaterThan(30);
      }
    }

    const questions = faqByContext.map((faq) => faq[0]?.question);
    expect(new Set(questions).size).toBe(CONTEXTS.length);

    const panel = resolveTopBarPanel("open-help", "tatuadores");
    expect(panel?.body.type).toBe("faq");
    if (panel?.body.type === "faq") {
      expect(panel.body.items).toBe(getHelpFaq("tatuadores"));
    }
  });

  test("plataformas, mapa, agenda e termos entregam listas com CTA", () => {
    for (const actionId of ["open-platforms", "open-map", "open-agenda", "open-terms"] as const) {
      const panel = resolveTopBarPanel(actionId, "landing");
      expect(panel?.body.type).toBe("list");
      if (panel?.body.type === "list") {
        expect(panel.body.items.length).toBeGreaterThanOrEqual(4);
        for (const item of panel.body.items) {
          expect(item.title.length).toBeGreaterThan(3);
          expect(item.description.length).toBeGreaterThan(40);
        }
        expect(panel.body.cta?.href.startsWith("/")).toBe(true);
      }
    }
  });

  test("accent acompanha o contexto de tatuadores", () => {
    expect(resolveTopBarPanel("open-feedback", "tatuadores")?.accent).toBe("green");
    expect(resolveTopBarPanel("open-feedback", "landing")?.accent).toBe("orange");
  });
});
