"use client";

import { useCallback, useEffect, useRef } from "react";
import { Decal, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshPhysicalMaterial, SRGBColorSpace, type Texture } from "three";

import { useScrollStore } from "@/components/scrollProgressStore";

const INK_TEXTURE_PATH = "/assets/images/ink-stroke.svg";
type PhysicalShader = Parameters<MeshPhysicalMaterial["onBeforeCompile"]>[0];

function OrganicInkDecal({ reducedMotion }: { reducedMotion: boolean }) {
  const configureTexture = useCallback((loadedTexture: Texture) => {
    loadedTexture.colorSpace = SRGBColorSpace;
    loadedTexture.anisotropy = 4;
  }, []);
  const texture = useTexture(INK_TEXTURE_PATH, configureTexture);
  const shaderRef = useRef<PhysicalShader | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  const onBeforeCompile = useCallback(
    (shader: PhysicalShader) => {
      shader.uniforms.uDrawProgress = {
        value: reducedMotion ? 1 : useScrollStore.getState().drawProgress,
      };
      shaderRef.current = shader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        "#include <common>\nuniform float uDrawProgress;",
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
         #ifdef USE_MAP
           float inkReveal = 1.0 - smoothstep(
             uDrawProgress - 0.025,
             uDrawProgress + 0.025,
             vMapUv.x
           );
           diffuseColor.a *= inkReveal;
         #endif`,
      );
    },
    [reducedMotion],
  );

  useFrame(() => {
    if (!shaderRef.current) return;
    shaderRef.current.uniforms.uDrawProgress.value = reducedMotion
      ? 1
      : useScrollStore.getState().drawProgress;
  });

  const handleMaterialRef = useCallback(
    (material: MeshPhysicalMaterial | null) => {
      if (!material) return;
      material.customProgramCacheKey = () =>
        "organic-ink-reveal-v1";
    },
    [],
  );

  return (
    <Decal
      position={[0, 0, 0.385]}
      rotation={[0, 0, Math.PI / 2]}
      scale={[0.88, 0.52, 0.16]}
      map={texture}
      depthTest
      polygonOffsetFactor={-4}
    >
      <meshPhysicalMaterial
        ref={handleMaterialRef}
        map={texture}
        roughness={0.88}
        metalness={0}
        clearcoat={0}
        alphaTest={0.18}
        transparent={false}
        onBeforeCompile={onBeforeCompile}
      />
    </Decal>
  );
}

export default function InteractiveTattooArm({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const { viewport } = useThree();
  const armScale = Math.min(1, viewport.width / 6.5);
  const armX = Math.min(viewport.width * 0.16, 2);
  const armY = viewport.height < 6 ? -2.15 : -1.8;

  return (
    <group
      position={[armX, armY, -0.55]}
      scale={armScale}
      rotation={[0, 0, Math.PI / 2]}
    >
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.39, 1.7, 8, 24]} />
        <meshPhysicalMaterial
          color="#b87960"
          roughness={0.78}
          metalness={0}
          clearcoat={0.08}
          clearcoatRoughness={0.9}
        />
        <OrganicInkDecal reducedMotion={reducedMotion} />
      </mesh>
    </group>
  );
}
