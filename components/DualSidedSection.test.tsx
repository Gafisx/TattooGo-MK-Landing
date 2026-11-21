import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import DualSidedSection from "./DualSidedSection";

// 1. Mock do GSAP para não rodar animações reais no teste (happy-dom não tem GPU)
vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn) => fn()),
    fromTo: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    utils: {
      toArray: vi.fn(() => []),
    },
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

// 2. Mock do Framer Motion (usado no FlipCard) para renderizar como HTML simples
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useMotionValue: () => ({ set: vi.fn(), get: vi.fn(), jump: vi.fn() }),
  useSpring: () => ({ set: vi.fn(), get: vi.fn() }),
  useTransform: () => ({ get: vi.fn() }),
  useMotionTemplate: () => ({}),
  animate: vi.fn(),
  useReducedMotion: () => false,
}));

// 3. Mock do Next/Image
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe("DualSidedSection", () => {
  beforeAll(() => {
    // Mock do matchMedia para evitar erros de ambiente
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

    // Título da seção
    expect(screen.getByText(/A mesma plataforma. Dois lados da arte./i)).toBeInTheDocument();
    
    // Títulos dos lados
    expect(screen.getByText(/Para clientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Para tatuadores/i)).toBeInTheDocument();
  });

  it("deve renderizar os FlipCards com os textos de ação", () => {
    render(<DualSidedSection />);

    // Textos que estão dentro dos FlipCards (frente)
    const exploreButtons = screen.getAllByText(/Toque para explorar/i);
    expect(exploreButtons).toHaveLength(2); // Um para cliente, um para tatuador

    // Textos que estão dentro dos FlipCards (verso)
    expect(screen.getByText(/Encontre seu Artista/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestão Completa/i)).toBeInTheDocument();
  });

  it("deve renderizar as listas de benefícios corretamente", () => {
    render(<DualSidedSection />);

    // Benefícios de Clientes
    expect(screen.getByText(/Perto de você/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfólios verificados/i)).toBeInTheDocument();

    // Benefícios de Tatuadores
    expect(screen.getByText(/Agenda sob controle/i)).toBeInTheDocument();
    expect(screen.getByText(/Ganhos transparentes/i)).toBeInTheDocument();
  });
});