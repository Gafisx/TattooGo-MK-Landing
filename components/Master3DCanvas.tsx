"use client";

import {
  Component,
  Suspense,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { View, Preload, PerformanceMonitor } from "@react-three/drei";

import StudioLighting from "@/components/StudioLighting";
import ReducedMotionFallback from "@/components/ReducedMotionFallback";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// Fix vazamento de contexto WebGL: Testa e destrói imediatamente
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
    const loseContext = gl.getExtension("WEBGL_lose_context");
    if (loseContext) loseContext.loseContext();
    return true;
  } catch {
    return false;
  }
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("3D Error", error, info); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function Master3DCanvas() {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const [webGLAvailable] = useState(() => typeof document !== "undefined" ? supportsWebGL() : false);
  const reducedMotion = usePrefersReducedMotion();

  if (!webGLAvailable) return <ReducedMotionFallback />;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#121212]">
      <WebGLErrorBoundary fallback={<ReducedMotionFallback />}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 9], fov: 40, near: 0.1, far: 40 }}
          dpr={dpr}
          // Trocado para "default" para evitar troca de GPU em Macs e perda de contexto
          gl={{ alpha: true, antialias: true, powerPreference: "default" }}
          // Habilita os eventos 3D dentro do DOM
          eventSource={typeof document !== "undefined" ? document.body : undefined}
          eventPrefix="client"
          onCreated={({ gl }) => {
            gl.setClearColor("#121212", 0);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
          }}
        >
          {/* Monitor de performance: se cair o FPS, baixa o DPR automaticamente */}
          <PerformanceMonitor onDecline={() => setDpr([1, 1])} />

          <Suspense fallback={null}>
            <StudioLighting />
            
            {/* O View.Port permite que componentes em outras partes do DOM se conectem a este Canvas */}
            <View.Port />
            
            {/* Pré-compila os materiais para evitar engasgos */}
            <Preload all />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}