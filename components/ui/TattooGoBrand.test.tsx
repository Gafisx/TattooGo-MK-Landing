import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import TattooGoBrand from "@/components/ui/TattooGoBrand";

describe("TattooGoBrand", () => {
  test("renderiza a assinatura na ordem da Home: TattooGo + MK", () => {
    const { container } = render(<TattooGoBrand />);
    const brand = container.querySelector(".tattoo-brand");
    expect(brand).not.toBeNull();

    const parts = Array.from(container.querySelectorAll(".tattoo-brand__word, .tattoo-brand__mk"));
    expect(parts.map((part) => part.textContent)).toEqual(["TattooGo", "MK"]);
    expect(container.querySelector(".tattoo-brand__mk")?.textContent).toBe("MK");
  });

  test("expõe nome acessível e esconde o desenho decorativo da árvore de acessibilidade", () => {
    render(<TattooGoBrand />);
    expect(screen.getByRole("img", { name: "TattooGo MK" })).toBeInTheDocument();

    const word = document.querySelector(".tattoo-brand__word");
    const mk = document.querySelector(".tattoo-brand__mk");
    expect(word).toHaveAttribute("aria-hidden", "true");
    expect(mk).toHaveAttribute("aria-hidden", "true");
  });

  test("quando decorativa dentro de um slot já rotulado, some para leitores de tela", () => {
    const { container } = render(
      <button type="button" aria-label="TattooGo MK — ir para a página inicial">
        <TattooGoBrand size="xs" decorative />
      </button>,
    );

    expect(screen.queryByRole("img", { name: "TattooGo MK" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "TattooGo MK — ir para a página inicial" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".tattoo-brand")).toHaveAttribute("aria-hidden", "true");
  });

  test("escalas oficiais mudam apenas o tamanho, mantendo o mesmo desenho", () => {
    const { container, rerender } = render(<TattooGoBrand size="sm" />);
    expect(container.querySelector(".tattoo-brand")).toHaveAttribute("data-size", "sm");

    rerender(<TattooGoBrand size="lg" />);
    const brand = container.querySelector(".tattoo-brand");
    expect(brand).toHaveAttribute("data-size", "lg");
    expect(container.querySelector(".tattoo-brand__stroke")).not.toBeNull();
    expect(container.querySelector(".tattoo-brand__word")?.textContent).toBe("TattooGo");
  });

  test("rótulo customizado é respeitado sem alterar o desenho", () => {
    render(<TattooGoBrand label="Marca TattooGo MK" />);
    expect(screen.getByRole("img", { name: "Marca TattooGo MK" })).toBeInTheDocument();
  });
});
