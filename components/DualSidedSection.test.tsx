import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import DualSidedSection from "@/components/DualSidedSection";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

describe("DualSidedSection", () => {
  afterEach(cleanup);

  it("renderiza as duas jornadas em conteúdo invertido e com nomes semânticos", () => {
    setPrefersReducedMotion(true);
    render(<DualSidedSection />);

    const section = screen.getByRole("heading", { name: /Feito para quem/i }).closest("section");
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { name: /A sua próxima tatuagem/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /Mais tempo para criar/i })).toBeVisible();

    const articleNames = screen
      .getAllByRole("article")
      .map((article) => within(article).getAllByRole("heading")[0].textContent);
    expect(articleNames).toEqual([
      "A sua próxima tatuagem começa aqui.",
      "Mais tempo para criar. Controle para crescer.",
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
