import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HeroSection from "@/components/HeroSection";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";
const gsapMock = vi.hoisted(() => {
  const revert = vi.fn();
  const timeline = {
    to: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
  };
  return { revert, timeline };
});

vi.mock("gsap", () => ({
  default: {
    context: vi.fn((_callback: () => void) => {
      _callback();
      return { revert: gsapMock.revert };
    }),
    set: vi.fn(),
    timeline: vi.fn(() => gsapMock.timeline),
    registerPlugin: vi.fn(),
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

describe("HeroSection", () => {
  beforeEach(() => {
    setPrefersReducedMotion(false);
  });

  afterEach(cleanup);

  it("registra uma gsap.context e remove a timeline no unmount", () => {
    const { unmount } = render(<HeroSection />);
    expect(gsapMock.timeline.to).toHaveBeenCalled();
    unmount();
    expect(gsapMock.revert).toHaveBeenCalled();
  });

  it("não cria animação GSAP com movimento reduzido", () => {
    setPrefersReducedMotion(true);
    render(<HeroSection />);
    expect(gsapMock.timeline.to).not.toHaveBeenCalled();
  });

  it("expõe heading e links com nomes acessíveis", () => {
    setPrefersReducedMotion(true);
    render(<HeroSection />);
    expect(screen.getByRole("heading", { name: /TattooGo MK/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /Para clientes/i })).toHaveAttribute(
      "href",
      "#clients-title",
    );
  });

});
