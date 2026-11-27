import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { createElement, type ImgHTMLAttributes } from "react";

// O three 0.187 avisa (`THREE_CJS_DEPRECATED`) sempre que um consumidor CommonJS
// faz `require("three")`. Os builds CJS de `@react-three/drei` e de
// `@react-three/test-renderer` são escolhidos pelo Node através do campo `main`,
// fora do controle do projeto. Silenciamos somente esse código; qualquer outro
// aviso de deprecacão continua sendo exibido.
const emitWarning = process.emitWarning.bind(process);
process.emitWarning = ((warning: string | Error, ...rest: unknown[]) => {
  const first = rest[0];
  const code =
    typeof first === "string"
      ? rest[1]
      : first && typeof first === "object" && "code" in first
        ? (first as { code?: unknown }).code
        : undefined;
  if (code === "THREE_CJS_DEPRECATED") return;
  (emitWarning as (...args: unknown[]) => void)(warning, ...rest);
}) as typeof process.emitWarning;

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
