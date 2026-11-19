import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  configureInkRevealShader,
  getInkRevealProgress,
  InteractiveTattooArmFallback,
  updateInkRevealUniform,
  type InkRevealShader,
} from "@/components/InteractiveTattooArm";
import { useScrollStore } from "@/components/scrollProgressStore";

const r3fMock = vi.hoisted(() => ({
  dispose: vi.fn(),
}));

vi.mock("@react-three/drei", () => ({
  Decal: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTexture: () => ({
    clone: () => ({
      colorSpace: 0,
      anisotropy: 0,
      needsUpdate: false,
      dispose: r3fMock.dispose,
    }),
  }),
  useGLTF: vi.fn(),
}));

vi.mock("@react-three/fiber", () => ({
  createPortal: (children: React.ReactNode) => children,
  useFrame: vi.fn(),
  useThree: (selector?: (state: { invalidate: () => void; viewport: { width: number } }) => unknown) => {
    const state = { invalidate: vi.fn(), viewport: { width: 10 } };
    return selector ? selector(state) : state;
  },
}));

describe("InteractiveTattooArmFallback", () => {
  beforeEach(() => {
    useScrollStore.setState({ progress: 0 });
    r3fMock.dispose.mockClear();
  });

  it("registra o shader, atualiza uProgress pelo scroll e limpa a textura", () => {
    const pathRef = { current: null };
    const { unmount } = render(
      <InteractiveTattooArmFallback reducedMotion={false} pathRef={pathRef} />,
    );

    expect(pathRef.current).not.toBeNull();
    const shader: InkRevealShader = {
      uniforms: {},
      fragmentShader: "#include <common>\n#include <map_fragment>",
    };
    configureInkRevealShader(shader, false);
    expect(shader.uniforms.uProgress.value).toBe(0);
    expect(shader.fragmentShader).toContain("bleedNoise");

    useScrollStore.getState().setProgress(0.72);
    updateInkRevealUniform(shader, false);
    expect(shader.uniforms.uProgress.value).toBe(0.72);
    expect(getInkRevealProgress(false)).toBe(shader.uniforms.uProgress.value);

    unmount();
    expect(r3fMock.dispose).toHaveBeenCalledTimes(1);
  });

  it("usa uniform estático em 1 com preferência reduzida", () => {
    useScrollStore.setState({ progress: 0.25 });
    const pathRef = { current: null };
    render(
      <InteractiveTattooArmFallback reducedMotion pathRef={pathRef} />,
    );
    expect(pathRef.current).not.toBeNull();
    expect(getInkRevealProgress(true)).toBe(1);
  });
});
