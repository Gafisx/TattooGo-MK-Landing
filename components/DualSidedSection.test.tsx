import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import DualSidedSection from "@/components/DualSidedSection";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

describe("DualSidedSection", () => {
  afterEach(cleanup);

  it("renderiza as duas jornadas em conteúdo invertido e com nomes semânticos", () => {
    setPrefersReducedMotion(true);
    render(<DualSidedSection />);

    const section = screen
      .getByRole("heading", { name: /Para quem tatua/i })
      .closest("section");
    expect(section).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: /Encontre o traço/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /Seu trabalho merece alcance/i }),
    ).toBeVisible();

    const articleNames = screen
      .getAllByRole("article")
      .map((article) => within(article).getAllByRole("heading")[0].textContent);
    expect(articleNames).toEqual([
      "Encontre o traço que fala por você.",
      "Seu trabalho merece alcance. Sua agenda, controle.",
    ]);
  });

  it("mantém mockups decorativos e benefícios em listas legíveis", () => {
    setPrefersReducedMotion(true);
    render(<DualSidedSection />);
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByText(/Segurança em cada etapa|Custódia acompanhada/i).length)
      .toBeGreaterThan(0);
  });
});
