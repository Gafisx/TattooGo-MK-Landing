"use client";

import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";

import InkStrokePlane from "@/components/InkStrokePlane";
import TattooMachineModel, {
  MinimalMachineFallback,
} from "@/components/TattooMachineModel";
import StudioLighting from "@/components/StudioLighting";
import ScrollProgressBridge from "@/components/ScrollProgressBridge";
import ReducedMotionFallback from "@/components/ReducedMotionFallback";

type WebGLErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type WebGLErrorBoundaryState = {
  failed: boolean;
};

class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  state: WebGLErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("TattooGo 3D scene failed to render", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

function SceneBudgetProbe() {
  const warnedRef = useRef(false);

  useFrame(({ gl }) => {
    if (process.env.NODE_ENV !== "development" || warnedRef.current) return;

    const drawCallCount = gl.info.render.calls;
    if (drawCallCount > 100) {
      warnedRef.current = true;
      console.warn(
        `[TattooGo] Scene rendered ${drawCallCount} draw calls; reduce scene complexity to stay within the 100-call budget.`,
      );
    }
  });
  return null;
}

export default function Master3DCanvas() {
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const [webGLAvailable] = useState(() =>
    typeof document !== "undefined" ? supportsWebGL() : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!webGLAvailable) {
    return <ReducedMotionFallback />;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <WebGLErrorBoundary fallback={<ReducedMotionFallback />}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 9], fov: 40, near: 0.1, far: 40 }}
          dpr={[1, 2]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#121212", 0);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
          }}
        >
          <Suspense
            fallback={
              <group position={[0, 0, 0]}>
                <MinimalMachineFallback />
              </group>
            }
          >
            <StudioLighting />
            <ScrollProgressBridge reducedMotion={reducedMotion} />
            <WebGLErrorBoundary fallback={<MinimalMachineFallback />}>
              <TattooMachineModel reducedMotion={reducedMotion} />
            </WebGLErrorBoundary>
            <InkStrokePlane reducedMotion={reducedMotion} />
            <SceneBudgetProbe />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
