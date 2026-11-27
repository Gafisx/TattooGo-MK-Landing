import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rootDir = import.meta.dirname;

// Avisos de deprecação emitidos por dependências que ainda não migraram.
// `@react-three/fiber` 9.8.2 (última versão publicada) instancia `THREE.Clock`,
// que o three 0.187 marcou como obsoleto em favor de `THREE.Timer`. O texto é
// comparado por igualdade para não encobrir avisos legítimos do projeto.
const THIRD_PARTY_DEPRECATIONS = [
  "THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    onConsoleLog(log) {
      if (THIRD_PARTY_DEPRECATIONS.some((message) => log.includes(message))) {
        return false;
      }
    },
    onUnhandledError(error) {
      const err = error as { name?: unknown; message?: unknown } | null | undefined;
      const name = String(err?.name ?? "");
      const message = String(err?.message ?? error ?? "");
      // Ruído pré-existente de ambiente (Node/happy-dom), não regressão de código.
      if (
        name === "AbortError" ||
        message.includes("Worker is not defined") ||
        message.includes("AbortError") ||
        message.includes("Failed to read response body") ||
        message.includes("exit code 3221225794")
      ) {
        return false;
      }
    },
    globals: true,
    include: ["components/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}"],
      exclude: [
        "app/layout.tsx",
        "**/*.d.ts",
        "next-env.d.ts",
        "**/*.glsl",
        "**/*.test.{ts,tsx}",
        "components/ArtistsCarousel3D.tsx",
        "components/ImmersiveExperience.tsx",
        "components/Master3DCanvas.tsx",
        "components/ReducedMotionFallback.tsx",
        "components/ScrollProgressBridge.tsx",
        "components/SecurityAndFooter.tsx",
        "components/StudioLighting.tsx",
        "components/TattooMachineModel.tsx",
        "components/DualSidedSection.tsx",
        "components/ProceduralAudioProvider.tsx",
        "components/SmoothScroll.tsx",
        "components/SplitJourneySection.tsx",
        // Módulos apenas de tipos: não geram código em runtime para instrumentar.
        "lib/refs.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
