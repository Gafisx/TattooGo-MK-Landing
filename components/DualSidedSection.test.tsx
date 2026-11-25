import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import DualSidedSection from "./DualSidedSection";

// 1. Mock do GSAP BLINDADO (Agora retorna o .revert())
vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn) => {
      if (typeof fn === "function") fn();
      return { revert: vi.fn() };
    }),
    fromTo: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    utils: {
      toArray: vi.fn(() => []),
    },
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

// 2. Mock do Framer Motion
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: ComponentProps<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
  useMotionValue: () => ({ set: vi.fn(), get: vi.fn(), jump: vi.fn() }),
  useSpring: () => ({ set: vi.fn(), get: vi.fn() }),
  useTransform: () => ({ get: vi.fn() }),
  useMotionTemplate: () => ({}),
  animate: vi.fn(),
  useReducedMotion: () => false,
}));

describe("DualSidedSection", () => {
  beforeAll(() => {
    // Mock do matchMedia para não bugar no ambiente de teste
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("deve renderizar os títulos principais e a estrutura da seção", () => {
    render(<DualSidedSection />);

    expect(screen.getByText(/A mesma plataforma. Dois lados da arte./i)).toBeInTheDocument();
    expect(screen.getByText(/Para clientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Para tatuadores/i)).toBeInTheDocument();
  });

  it("deve renderizar os FlipCards com os textos de ação", () => {
    render(<DualSidedSection />);

    // Usamos getAllByText porque o card 3D renderiza os textos da frente e do verso no DOM
    const exploreButtons = screen.getAllByText(/Toque para explorar/i);
    expect(exploreButtons.length).toBeGreaterThan(0); 

    expect(screen.getByText(/Encontre seu Artista/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestão Completa/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Baixar o App/i })).toHaveAttribute(
      "href",
      "/download",
    );
    expect(screen.getByRole("link", { name: /Seja Parceiro/i })).toHaveAttribute(
      "href",
      "/tatuadores",
    );
  });

  it("deve renderizar as listas de benefícios corretamente", () => {
    render(<DualSidedSection />);

    // Usamos getAllByText()[0] para evitar o erro de "duplicate text match" no Vitest
    expect(screen.getAllByText(/Perto de você/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Portfólios verificados/i)).toBeInTheDocument();

    expect(screen.getByText(/Agenda sob controle/i)).toBeInTheDocument();
    expect(screen.getByText(/Ganhos transparentes/i)).toBeInTheDocument();
  });
});