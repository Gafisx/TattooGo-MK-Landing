import { beforeEach, describe, expect, it } from "vitest";

import { useScrollStore } from "@/components/scrollProgressStore";

describe("useScrollStore", () => {
  beforeEach(() => {
    useScrollStore.setState({
      progress: 0,
      artistsCarouselProgress: 0,
      artistsCarouselVisible: false,
    });
  });

  it("normaliza progresso e evita atualização redundante", () => {
    useScrollStore.getState().setProgress(-0.2);
    expect(useScrollStore.getState().progress).toBe(-0.2);
    useScrollStore.getState().setProgress(-0.2);
    expect(useScrollStore.getState().progress).toBe(-0.2);
  });

  it("alterna a visibilidade do carrossel sem repetição", () => {
    useScrollStore.getState().setArtistsCarouselVisible(true);
    expect(useScrollStore.getState().artistsCarouselVisible).toBe(true);
    useScrollStore.getState().setArtistsCarouselVisible(true);
    expect(useScrollStore.getState().artistsCarouselVisible).toBe(true);
  });

  it("mantém o progresso local do carrossel independente do progresso global", () => {
    useScrollStore.getState().setProgress(0.8);
    useScrollStore.getState().setArtistsCarouselProgress(0.25);
    expect(useScrollStore.getState().progress).toBe(0.8);
    expect(useScrollStore.getState().artistsCarouselProgress).toBe(0.25);
  });
});
