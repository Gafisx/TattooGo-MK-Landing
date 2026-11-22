"use client";

import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";

import TattooMachineModel, { MinimalMachineFallback } from "@/components/TattooMachineModel";
import StudioLighting from "@/components/StudioLighting";
import ScrollProgressBridge from "@/components/ScrollProgressBridge";
import ReducedMotionFallback from "@/components/ReducedMotionFallback";
import ArtistsCarousel3D from "@/components/ArtistsCarousel3D";
import { useScrollStore } from "@/components/scrollProgressStore";

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
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

export default function Master3DCanvas() {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: "#121212" }}>
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
          <Suspense fallback={null}>
            <WebGLErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <StudioLighting />
              </Suspense>
            </WebGLErrorBoundary>
            <ScrollProgressBridge reducedMotion={reducedMotion} />
            <ArtistsCarousel3D reducedMotion={reducedMotion} />
            
            {/* AQUI: Removemos a condicional. A máquina fica sempre montada */}
            <WebGLErrorBoundary fallback={<MinimalMachineFallback />}>
              <TattooMachineModel reducedMotion={reducedMotion} />
            </WebGLErrorBoundary>
            
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}