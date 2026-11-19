export function setPrefersReducedMotion(reduced: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    matches: reduced,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(
      (_type: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_type: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  } as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn((query: string) => {
    if (query === "(prefers-reduced-motion: reduce)") return mediaQueryList;
    return {
      ...mediaQueryList,
      matches: false,
      media: query,
    } as MediaQueryList;
  }));
  return {
    mediaQueryList,
    update(next: boolean) {
      Object.defineProperty(mediaQueryList, "matches", {
        configurable: true,
        value: next,
      });
      for (const listener of listeners) {
        listener({ matches: next, media: mediaQueryList.media } as MediaQueryListEvent);
      }
    },
  };
}
import { vi } from "vitest";

