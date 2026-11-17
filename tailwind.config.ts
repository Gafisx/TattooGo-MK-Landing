import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          deep: "#121212",
          surface: "#1A1A1A",
        },
        neon: {
          orange: "#FF6600",
        },
        amber: {
          glow: "#FF9900",
        },
      },
      perspective: {
        "120hz": "1200px",
      },
    },
  },
  plugins: [
    function gpuAcceleration({ addUtilities }: any) {
      addUtilities({
        ".gpu-accelerate": {
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: "1200px",
          willChange: "transform, opacity",
        },
        ".gpu-accelerate-child": {
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          willChange: "transform",
        },
      });
    },
  ],
} satisfies Config;
