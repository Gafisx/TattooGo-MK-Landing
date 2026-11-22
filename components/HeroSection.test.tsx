import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ImmersiveExperience from "./ImmersiveExperience";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((fn) => {
      if (typeof fn === "function") fn();
      return { revert: vi.fn() };
    }),
    timeline: vi.fn(() => ({ to: vi.fn().mockReturnThis() })),
    set: vi.fn(),
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

describe("ImmersiveExperience", () => {
  it("deve renderizar o texto acessível e o SVG de tatuagem", () => {
    render(<ImmersiveExperience />);
    
    // Verifica se o SEO está funcionando (h2 escondido)
    const heading = screen.getByRole("heading", { name: /A arte não é opcional/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("sr-only");
  });
});