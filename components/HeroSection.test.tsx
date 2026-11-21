import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeroSection from "./HeroSection";
import { ProceduralAudioContext } from "./useProceduralAudio";

// Mock do GSAP para não bugar no ambiente de teste (happy-dom)
vi.mock("gsap", () => ({
  default: {
    context: vi.fn((fn) => fn()),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock do hook de áudio
const mockPlayHoverClick = vi.fn();

describe("HeroSection", () => {
  it("deve renderizar o título 3D, a tagline e os botões", () => {
    render(
      <ProceduralAudioContext.Provider value={{ muted: true, toggleMuted: vi.fn(), playHoverClick: mockPlayHoverClick }}>
        <HeroSection />
      </ProceduralAudioContext.Provider>
    );

    // Verifica se o texto do Hero está na tela
    expect(screen.getAllByText("TattooGo")[0]).toBeInTheDocument();
    expect(screen.getAllByText("MK")[0]).toBeInTheDocument();
    expect(screen.getByText("A arte não é opcional.")).toBeInTheDocument();

    // Verifica se os botões existem e são acessíveis
    const btnClientes = screen.getByRole("link", { name: /Para clientes/i });
    const btnTatuadores = screen.getByRole("link", { name: /Para tatuadores/i });
    expect(btnClientes).toBeInTheDocument();
    expect(btnTatuadores).toBeInTheDocument();
  });

  it("deve disparar o áudio ao passar o mouse nos botões", () => {
    render(
      <ProceduralAudioContext.Provider value={{ muted: true, toggleMuted: vi.fn(), playHoverClick: mockPlayHoverClick }}>
        <HeroSection />
      </ProceduralAudioContext.Provider>
    );

    const btnClientes = screen.getByRole("link", { name: /Para clientes/i });
    
    // Simula o usuário passando o mouse
    fireEvent.mouseEnter(btnClientes);
    
    // Verifica se a função de áudio foi chamada
    expect(mockPlayHoverClick).toHaveBeenCalledTimes(1);
  });
});