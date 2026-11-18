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
import type { TattooPath } from "@/components/tattooPath";

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

function FrameBudgetProbe({ onSlowFrame }: { onSlowFrame: () => void }) {
  const warnedDrawCallsRef = useRef(false);
  const warnedFrameTimeRef = useRef(false);
  const frameTimeTotalRef = useRef(0);
  const frameCountRef = useRef(0);

  useFrame(({ gl }, delta) => {
    if (process.env.NODE_ENV !== "development") return;

    const drawCallCount = gl.info.render.calls;
    if (drawCallCount > 100 && !warnedDrawCallsRef.current) {
      warnedDrawCallsRef.current = true;
      console.warn(
        `[TattooGo] Scene rendered ${drawCallCount} draw calls; reduce scene complexity to stay within the 100-call budget.`,
      );
    }

    if (warnedFrameTimeRef.current) return;

    if (!Number.isFinite(delta) || delta > 0.1) {
      frameTimeTotalRef.current = 0;
      frameCountRef.current = 0;
      return;
    }

    frameTimeTotalRef.current += delta;
    frameCountRef.current += 1;
    if (frameCountRef.current < 60) return;

    const averageFrameTime =
      (frameTimeTotalRef.current / frameCountRef.current) * 1000;
    if (averageFrameTime > 16.6) {
      warnedFrameTimeRef.current = true;
      console.warn(
        `[TattooGo] Active frame interval averaged ${averageFrameTime.toFixed(
          1,
        )}ms; reducing the Canvas DPR cap to 1.5.`,
      );
      onSlowFrame();
    }

    frameTimeTotalRef.current = 0;
    frameCountRef.current = 0;
  });
  return null;
}

export default function Master3DCanvas() {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const tattooPathRef = useRef<TattooPath | null>(null);
  const lowerDprForPerformance = useCallback(
    () => setDpr([1, 1.5]),
    [],
  );
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
          dpr={dpr}
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
            <WebGLErrorBoundary
              fallback={
                <InteractiveTattooArmFallback
                  reducedMotion={reducedMotion}
                  pathRef={tattooPathRef}
                />
              }
            >
              <Suspense
                fallback={
                  <InteractiveTattooArmFallback
                    reducedMotion={reducedMotion}
                    pathRef={tattooPathRef}
                  />
                }
              >
                <InteractiveTattooArm
                  reducedMotion={reducedMotion}
                  pathRef={tattooPathRef}
                />
              </Suspense>
            </WebGLErrorBoundary>
            <WebGLErrorBoundary fallback={<MinimalMachineFallback />}>
              <TattooMachineModel
                reducedMotion={reducedMotion}
                pathRef={tattooPathRef}
              />
            </WebGLErrorBoundary>
            <FrameBudgetProbe onSlowFrame={lowerDprForPerformance} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
