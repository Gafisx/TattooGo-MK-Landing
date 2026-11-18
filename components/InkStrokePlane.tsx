"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ShaderMaterial } from "three";

import { useScrollStore } from "@/components/scrollProgressStore";

type InkStrokePlaneProps = {
  reducedMotion: boolean;
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    float wave = sin(vUv.x * 13.0 + sin(vUv.x * 7.0)) * 0.027;
    wave += sin(vUv.x * 31.0) * 0.009;
    float centerLine = 0.5 + wave;
    float strokeWidth = 0.018 + 0.012 * (0.5 + 0.5 * sin(vUv.x * 19.0));
    float distanceFromStroke = abs(vUv.y - centerLine);
    float stroke = 1.0 - smoothstep(strokeWidth * 0.35, strokeWidth, distanceFromStroke);
    float reveal = 1.0 - smoothstep(uProgress - 0.035, uProgress + 0.012, vUv.x);
    float taper = smoothstep(0.0, 0.035, vUv.x);
    float alpha = stroke * reveal * taper;
    if (alpha < 0.06) discard;

    vec3 neon = mix(vec3(1.0, 0.24, 0.0), vec3(0.0, 1.0, 0.4), vUv.x);
    gl_FragColor = vec4(neon * 1.15, alpha);
  }
`;

export default function InkStrokePlane({
  reducedMotion,
}: InkStrokePlaneProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { viewport } = useThree();
  const strokeWidth = Math.min(viewport.width * 0.84, 5.4);
  const strokeHeight = strokeWidth * (1.1 / 5.4);
  const strokeX = Math.min(viewport.width * 0.12, 1.5);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = reducedMotion ? 1 : 0;
    }
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion || !materialRef.current) return;
    const state = useScrollStore.getState();
    materialRef.current.uniforms.uProgress.value =
      Math.max(state.progress, state.drawProgress);
  });

  return (
    <group position={[strokeX, -1.8, -1.2]} rotation={[0, 0, -0.12]}>
      <mesh rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[strokeWidth, strokeHeight, 1, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uProgress: { value: reducedMotion ? 1 : 0 } }}
          transparent
          alphaTest={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
