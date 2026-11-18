"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, ShaderMaterial } from "three";

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
    float revealEdge = smoothstep(uProgress - 0.055, uProgress + 0.018, vUv.x);
    float organic = sin(vUv.x * 38.0 + vUv.y * 11.0) * 0.018;
    float band = smoothstep(0.14 + organic, 0.48, vUv.y);
    band *= smoothstep(0.86 - organic, 0.54, vUv.y);
    float alpha = (1.0 - revealEdge) * band;
    if (alpha < 0.055) discard;

    vec3 neon = mix(vec3(1.0, 0.24, 0.0), vec3(0.0, 1.0, 0.4), vUv.x);
    gl_FragColor = vec4(neon * (0.82 + 0.18 * band), alpha);
  }
`;

export default function InkStrokePlane({
  reducedMotion,
}: InkStrokePlaneProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);

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
    <group ref={groupRef} position={[1.9, -1.8, -1.2]} rotation={[0, 0, -0.12]}>
      <mesh rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[5.4, 1.1, 1, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uProgress: { value: reducedMotion ? 1 : 0 } }}
          transparent
          alphaTest={0.055}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
