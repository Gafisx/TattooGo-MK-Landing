"use client";

import {
  Component,
  Suspense,
  useEffect,
  useCallback,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";

import InteractiveTattooArm, {
  InteractiveTattooArmFallback,
} from "@/components/InteractiveTattooArm";
import TattooMachineModel, {
  MinimalMachineFallback,
} from "@/components/TattooMachineModel";
import StudioLighting from "@/components/StudioLighting";
import ScrollProgressBridge from "@/components/ScrollProgressBridge";
import ReducedMotionFallback from "@/components/ReducedMotionFallback";
import ArtistsCarousel3D from "@/components/ArtistsCarousel3D";
import { useScrollStore } from "@/components/scrollProgressStore";
import type { TattooPath } from "@/components/tattooPath";

// ... (Mantenha as classes WebGLErrorBoundary e FrameBudgetProbe iguais) ...

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("3D Error", error, info); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}

function FrameBudgetProbe({ onSlowFrame }: { onSlowFrame: () => void }) {
  const warnedRef = useRef(false);
  useFrame(({ gl }, delta) => {
    if (process.env.NODE_ENV !== "development" || warnedRef.current) return;
    if (gl.info.render.calls > 100) {
      console.warn("Draw calls acima do limite");
      warnedRef.current = true;
    }
  });
  return null;
}

export default function Master3DCanvas() {
  const artistsCarouselVisible = useScrollStore((s) => s.artistsCarouselVisible);
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const tattooPathRef = useRef<TattooPath | null>(null);
  const lowerDpr = useCallback(() => setDpr([1, 1.5]), []);
  
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webGLAvailable] = useState(() => typeof document !== "undefined" ? supportsWebGL() : false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  if (!webGLAvailable) return <ReducedMotionFallback />;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "#121212" }} // Fundo sempre visível
    >
      <WebGLErrorBoundary fallback={<ReducedMotionFallback />}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 9], fov: 40, near: 0.1, far: 40 }}
          dpr={dpr}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#121212", 0);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
          }}
        >
          {/* O Fallback do Suspense agora é um material escuro, não null */}
          <Suspense fallback={null}>
            <WebGLErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <StudioLighting />
              </Suspense>
            </WebGLErrorBoundary>
            <ScrollProgressBridge reducedMotion={reducedMotion} />
            <ArtistsCarousel3D reducedMotion={reducedMotion} />
            
            {!artistsCarouselVisible && (
              <>
                <WebGLErrorBoundary fallback={<InteractiveTattooArmFallback reducedMotion={reducedMotion} pathRef={tattooPathRef} />}>
                  <Suspense fallback={<InteractiveTattooArmFallback reducedMotion={reducedMotion} pathRef={tattooPathRef} />}>
                    <InteractiveTattooArm reducedMotion={reducedMotion} pathRef={tattooPathRef} />
                  </Suspense>
                </WebGLErrorBoundary>
                <WebGLErrorBoundary fallback={<MinimalMachineFallback />}>
                  <TattooMachineModel reducedMotion={reducedMotion} pathRef={tattooPathRef} />
                </WebGLErrorBoundary>
              </>
            )}
            <FrameBudgetProbe onSlowFrame={lowerDpr} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
