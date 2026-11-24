import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createElement, type ImgHTMLAttributes } from "react";

// Mock global de Worker para evitar "Worker is not defined" do DRACOLoader (three/drei)
// ao importar módulos 3D em ambiente Node/happy-dom durante os testes.
class MockWorker {
  postMessage = vi.fn();
  terminate = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
}
vi.stubGlobal("Worker", MockWorker);

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
  }) => {
    const { priority, fill, sizes, ...rest } = props;
    void priority;
    void fill;
    void sizes;
    return createElement("img", rest);
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
