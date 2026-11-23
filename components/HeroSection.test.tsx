import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import HeroSection from "./HeroSection";
import { ProceduralAudioContext } from "./useProceduralAudio";

// Mock do GSAP
vi.mock("gsap", () => ({
  default: {
    context: vi.fn((fn) => {
      if (typeof fn === "function") fn();
      return { revert: vi.fn() };
    }),
    set: vi.fn(),
    timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis() })),
  },
}));

// Mock do Drei (View e StudioLighting não podem rodar sem Canvas)
vi.mock("@react-three/drei", () => ({
  View: ({ children }: { children?: ReactNode }) => (
    <div data-testid="three-view">{children}</div>
  ),
}));

// Mock do Modelo 3D
vi.mock("./TattooMachineModel", () => ({
  default: () => <div data-testid="tattoo-machine" />,
}));

vi.mock("./StudioLighting", () => ({
  default: () => <div data-testid="studio-lighting" />,
}));

const mockPlayHoverClick = vi.fn();

describe("HeroSection", () => {
  beforeAll(() => {
    vi.stubGlobal("requestAnimationFrame", vi.fn((cb) => setTimeout(cb, 0)));
    vi.stubGlobal("cancelAnimationFrame", vi.fn((id) => clearTimeout(id)));
    
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("deve renderizar a logo 3D, a tagline, os botões e a View do 3D", () => {
    render(
      <ProceduralAudioContext.Provider value={{ muted: true, toggleMuted: vi.fn(), playHoverClick: mockPlayHoverClick }}>
        <HeroSection />
      </ProceduralAudioContext.Provider>
    );

    expect(screen.getAllByText("TattooGo")[0]).toBeInTheDocument();
    expect(screen.getAllByText("MK")[0]).toBeInTheDocument();
    expect(screen.getAllByText("A arte não é opcional.")[0]).toBeInTheDocument();

    // Verifica se a View e o Modelo 3D foram montados
    expect(screen.getByTestId("three-view")).toBeInTheDocument();
    expect(screen.getByTestId("tattoo-machine")).toBeInTheDocument();

    const btnClientes = screen.getByRole("link", { name: /Para clientes/i });
    const btnTatuadores = screen.getByRole("link", { name: /Para tatuadores/i });
    expect(btnClientes).toBeInTheDocument();
    expect(btnTatuadores).toBeInTheDocument();
  });

  it("deve disparar o áudio procedural ao passar o mouse nos botões", () => {
    render(
      <ProceduralAudioContext.Provider value={{ muted: true, toggleMuted: vi.fn(), playHoverClick: mockPlayHoverClick }}>
        <HeroSection />
      </ProceduralAudioContext.Provider>
    );

    const btnClientes = screen.getByRole("link", { name: /Para clientes/i });
    fireEvent.mouseEnter(btnClientes);
    expect(mockPlayHoverClick).toHaveBeenCalledTimes(1);
  });
});