import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import ImmersiveExperience from "./ImmersiveExperience";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn) => {
      if (typeof fn === "function") fn();
      return { revert: vi.fn() };
    }),
    set: vi.fn(),
    timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis() })),
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));
vi.mock("@react-three/drei", () => ({
  View: ({ children }: { children?: ReactNode }) => (
    <div data-testid="three-view">{children}</div>
  ),
}));
vi.mock("./TattooMachineModel", () => ({
  default: () => <div data-testid="tattoo-machine" />,
}));
vi.mock("./StudioLighting", () => ({
  default: () => <div data-testid="studio-lighting" />,
}));

describe("ImmersiveExperience", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("deve renderizar o texto acessível, o SVG e a View do 3D", () => {
    render(<ImmersiveExperience />);
    
    expect(screen.getByRole("heading", { name: /A arte não é opcional/i })).toBeInTheDocument();
    expect(screen.getByTestId("three-view")).toBeInTheDocument();
    expect(screen.getByTestId("tattoo-machine")).toBeInTheDocument();
  });

  it("reserva a zona segura dos controles flutuantes no mobile", () => {
    const { container } = render(<ImmersiveExperience />);
    const section = container.querySelector("section");

    expect(section).not.toBeNull();
    // Respiro inferior: controle de áudio (esquerda) e TattooMenu (direita).
    expect(section?.className).toContain("var(--tattoo-float-safe-bottom)");
    expect(section?.className).toContain("env(safe-area-inset-bottom");
    // Desktop preservado: o respiro volta ao ritmo original a partir de sm.
    expect(section?.className).toContain("sm:pb-20");
    // Conteúdo textual continua centralizado e legível.
    expect(screen.getByText(/Role a página e veja a tinta ganhar vida/i)).toBeInTheDocument();
  });
});