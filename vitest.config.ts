import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
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
        "components/InteractiveTattooArm.tsx",
        "components/ProceduralAudioProvider.tsx",
        "components/SmoothScroll.tsx",
        "components/SplitJourneySection.tsx",
        // Módulos apenas de tipos: não geram código em runtime para instrumentar.
        "lib/refs.ts",
        "components/tattooPath.ts",
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
