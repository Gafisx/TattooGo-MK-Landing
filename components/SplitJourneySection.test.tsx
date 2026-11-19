import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import SplitJourneySection from "@/components/SplitJourneySection";
import { ProceduralAudioContext, type ProceduralAudioContextValue } from "@/components/useProceduralAudio";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

describe("SplitJourneySection", () => {
  afterEach(cleanup);

  it("mantém dois artigos com destinos internos e gatilhos de áudio no foco", () => {
    setPrefersReducedMotion(true);
    const playHoverClick = vi.fn();
    const value: ProceduralAudioContextValue = {
      muted: true,
      toggleMuted: vi.fn(async () => undefined),
      playHoverClick,
    };

    render(
      <ProceduralAudioContext.Provider value={value}>
        <SplitJourneySection />
      </ProceduralAudioContext.Provider>,
    );

    expect(screen.getByRole("region", { name: "Jornadas de cliente e tatuador" }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar artistas" }))
      .toHaveAttribute("href", "#clients-title");
    const artistLink = screen.getByRole("link", {
      name: "Organizar meu estúdio",
    });
    artistLink.focus();
    expect(playHoverClick).toHaveBeenCalled();
  });
});
