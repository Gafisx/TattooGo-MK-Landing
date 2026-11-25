import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
}));

vi.mock("@react-three/drei", () => ({
  View: Object.assign(() => null, {
    Port: () => <div data-testid="view-port" />,
  }),
  Preload: () => <div data-testid="preload-all" />,
  PerformanceMonitor: () => <div data-testid="perf-monitor" />,
}));

vi.mock("@/components/ScrollProgressBridge", () => ({
  default: ({ reducedMotion }: { reducedMotion: boolean }) => (
    <div data-testid="scroll-progress-bridge" data-reduced={String(reducedMotion)} />
  ),
}));

vi.mock("@/components/ArtistsCarousel3D", () => ({
  default: ({ reducedMotion }: { reducedMotion: boolean }) => (
    <div data-testid="artists-carousel-3d" data-reduced={String(reducedMotion)} />
  ),
}));

import Master3DCanvas from "@/components/Master3DCanvas";

describe("Master3DCanvas", () => {
  beforeEach(() => {
    setPrefersReducedMotion(false);
    vi.restoreAllMocks();
  });

  it("usa ReducedMotionFallback quando prefers-reduced-motion está ativo", () => {
    setPrefersReducedMotion(true);
    render(<Master3DCanvas />);
    expect(screen.getByTestId("reduced-motion-fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("r3f-canvas")).not.toBeInTheDocument();
  });

  it("conecta ScrollProgressBridge, ArtistsCarousel3D e View.Port quando WebGL está disponível", () => {
    const loseContext = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return {
          getContext: () => ({
            getExtension: () => ({ loseContext }),
          }),
        } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName);
    });

    render(<Master3DCanvas />);
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("scroll-progress-bridge")).toHaveAttribute("data-reduced", "false");
    expect(screen.getByTestId("artists-carousel-3d")).toHaveAttribute("data-reduced", "false");
    expect(screen.getByTestId("view-port")).toBeInTheDocument();
    expect(loseContext).toHaveBeenCalledTimes(1);
  });
});
