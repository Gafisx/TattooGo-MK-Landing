export function installGsapMock() {
  const revert = vi.fn();
  const timeline = {
    to: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    scrollTrigger: { refresh: vi.fn(), kill: vi.fn() },
    kill: vi.fn(),
  };

  vi.mock("gsap", () => ({
    default: {
      context: vi.fn((_callback: () => void) => {
        _callback();
        return { revert };
      }),
      set: vi.fn(),
      timeline: vi.fn(() => timeline),
      registerPlugin: vi.fn(),
      quickTo: vi.fn(() => vi.fn()),
      fromTo: vi.fn(),
      to: vi.fn(),
      killTweensOf: vi.fn(),
      matchMedia: vi.fn(() => ({ add: vi.fn(), revert: vi.fn() })),
      ticker: { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() },
    },
  }));

  vi.mock("gsap/ScrollTrigger", () => ({
    ScrollTrigger: {
      update: vi.fn(),
      refresh: vi.fn(),
      maxScroll: vi.fn(() => 1000),
    },
  }));

  return { timeline, revert };
}
import { vi } from "vitest";

