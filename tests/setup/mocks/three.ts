export const threeMocks = {
  invalidate: vi.fn(),
  frameCallbacks: [] as Array<(state: unknown, delta: number) => void>,
};

export function installThreeMocks() {
  vi.mock("@react-three/fiber", () => ({
    Canvas: ({ children }: { children: ReactNode }) =>
      createElement("div", { "data-testid": "r3f-canvas" }, children),
    useFrame: (callback: (state: unknown, delta: number) => void) => {
      threeMocks.frameCallbacks.push(callback);
    },
    useThree: (selector?: (state: { invalidate: () => void; viewport: { width: number } }) => unknown) => {
      const state = { invalidate: threeMocks.invalidate, viewport: { width: 10 } };
      return selector ? selector(state) : state;
    },
  }));
}
import type { ReactNode } from "react";
import { createElement } from "react";
import { vi } from "vitest";

