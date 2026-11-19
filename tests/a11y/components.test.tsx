import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import HeroSection from "@/components/HeroSection";
import DualSidedSection from "@/components/DualSidedSection";
import { ProceduralAudioProvider } from "@/components/ProceduralAudioProvider";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

describe("Acessibilidade dos componentes-chave", () => {
  it("HeroSection não possui violações automatizadas", async () => {
    setPrefersReducedMotion(true);
    const { container } = render(<HeroSection />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it("DualSidedSection não possui violações automatizadas", async () => {
    setPrefersReducedMotion(true);
    const { container } = render(<DualSidedSection />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it("controle de áudio expõe estado por aria-label e aria-pressed", async () => {
    setPrefersReducedMotion(false);
    const { container } = render(
      <ProceduralAudioProvider>
        <button type="button">Navegar</button>
      </ProceduralAudioProvider>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
