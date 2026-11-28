import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SubpageShell from "./SubpageShell";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    transitionTypes,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
    transitionTypes?: string[];
  }) => {
    // Prop exclusiva do next/link, não repassada ao DOM.
    void transitionTypes;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

describe("SubpageShell", () => {
  it("mantém o link de retorno no rodapé", () => {
    render(
      <SubpageShell>
        <p>Conteúdo</p>
      </SubpageShell>,
    );

    expect(screen.getByRole("link", { name: /Voltar para a Home/i })).toBeInTheDocument();
  });

  it("reserva a zona segura dos controles flutuantes no rodapé", () => {
    const { container } = render(
      <SubpageShell>
        <p>Conteúdo</p>
      </SubpageShell>,
    );

    const footerBar = container.querySelector("footer > div");

    expect(footerBar).not.toBeNull();
    // Respiro inferior mobile: áudio (canto inferior esquerdo) e TattooMenu
    // (canto inferior direito) não sobrepõem o rodapé.
    expect(footerBar?.className).toContain("var(--tattoo-float-safe-bottom)");
    expect(footerBar?.className).toContain("env(safe-area-inset-bottom");
    // Desktop preservado: volta ao ritmo original py-8 (com o canto do
    // TattooMenu liberado por pr-24).
    expect(footerBar?.className).toContain("lg:py-8");
  });
});
