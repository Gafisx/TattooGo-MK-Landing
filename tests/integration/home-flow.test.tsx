import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";
import { useScrollStore } from "@/components/scrollProgressStore";
import { installFakeAudioContext } from "@/tests/setup/mocks/audio";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";
import { ControlledIntersectionObserver } from "@/tests/setup/mocks/observers";

vi.mock("next/dynamic", () => ({
  default: () => function MockCanvas() {
    return <canvas aria-label="Cena 3D" />;
  },
}));

vi.mock("@/components/ImmersiveExperience", () => ({
  default: () => <section aria-label="Experiência imersiva" />,
}));
vi.mock("@/components/SplitJourneySection", () => ({
  default: () => <section aria-label="Jornadas" />,
}));
vi.mock("@/components/ArtistsCarousel3D", () => ({
  ArtistsCarouselSection: () => <section aria-label="Artistas" />,
}));
vi.mock("@/components/SecurityAndFooter", () => ({
  default: () => <footer>Segurança</footer>,
}));

describe("Fluxo integrado da home", () => {
  beforeEach(() => {
    useScrollStore.setState({ progress: 0, artistsCarouselVisible: false });
    setPrefersReducedMotion(false);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
  });

  it("carrega a home com o canvas cliente e mantém o áudio mudo antes do gesto", () => {
    installFakeAudioContext();
    render(<Home />);

    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Cena 3D")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ativar áudio" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));
  });

  it("desliga o áudio e usa fallback estático em movimento reduzido", () => {
    setPrefersReducedMotion(true);
    const AudioContextConstructor = installFakeAudioContext();
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Ativar áudio" }));
    expect(AudioContextConstructor).not.toHaveBeenCalled();
  });

  it("propaga progresso do scroll para o estado compartilhado", () => {
    render(<Home />);
    useScrollStore.getState().setProgress(0.75);
    expect(useScrollStore.getState().progress).toBe(0.75);
  });
});
