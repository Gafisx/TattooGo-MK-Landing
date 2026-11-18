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

function FrameBudgetProbe() {
  const accumulatedTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const warnedRef = useRef(false);

  useFrame((_state, delta) => {
    if (process.env.NODE_ENV !== "development") return;
    accumulatedTimeRef.current += delta * 1000;
    frameCountRef.current += 1;

    if (frameCountRef.current >= 120 && !warnedRef.current) {
      const averageFrameTime =
        accumulatedTimeRef.current / frameCountRef.current;
      if (averageFrameTime > 16.6) {
        warnedRef.current = true;
        console.warn(
          `[TattooGo] Average frame time is ${averageFrameTime.toFixed(
            1,
          )}ms. Reduce DPR, shadows, or scene complexity.`,
        );
      }
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
            <TattooMachineModel reducedMotion={reducedMotion} />
            <InkStrokePlane reducedMotion={reducedMotion} />
            <FrameBudgetProbe />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
