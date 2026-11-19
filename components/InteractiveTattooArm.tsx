"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  Box3,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector3,
  type Texture,
} from "three";

import { useScrollStore } from "@/components/scrollProgressStore";
import type { TattooPathRef } from "@/components/tattooPath";

const ARM_MODEL_PATH = "/assets/models/arm_with_skin.glb";
const TATTOO_TEXTURE_PATH = "/assets/decals/star-tattoo.svg";
const FALLBACK_TEXTURE_PATH = "/assets/decals/star-tattoo.svg";
const SKIN_NORMAL_TEXTURE_PATH = "/assets/textures/skin_normal.png";
type PhysicalShader = Parameters<MeshPhysicalMaterial["onBeforeCompile"]>[0];

function InkRevealMaterial({
  texture,
  reducedMotion,
}: {
  texture: Texture;
  reducedMotion: boolean;
}) {
  const shaderRef = useRef<PhysicalShader | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  const onBeforeCompile = useCallback(
    (shader: PhysicalShader) => {
      shader.uniforms.uProgress = {
        value: reducedMotion ? 1 : useScrollStore.getState().progress,
      };
      shaderRef.current = shader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
         uniform float uProgress;
         float tattooHash(vec2 point) {
           return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
         }
         float tattooNoise(vec2 point) {
           vec2 cell = floor(point);
           vec2 local = fract(point);
           local = local * local * (3.0 - 2.0 * local);
           float lower = mix(
             tattooHash(cell),
             tattooHash(cell + vec2(1.0, 0.0)),
             local.x
           );
           float upper = mix(
             tattooHash(cell + vec2(0.0, 1.0)),
             tattooHash(cell + vec2(1.0, 1.0)),
             local.x
           );
           return mix(lower, upper, local.y);
         }
         float tattooFbm(vec2 point) {
           float value = 0.0;
           float amplitude = 0.5;
           for (int octave = 0; octave < 4; octave++) {
             value += amplitude * tattooNoise(point);
             point = point * 2.0 + vec2(13.1, 7.7);
             amplitude *= 0.5;
           }
           return value;
         }`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>
         #ifdef USE_MAP
          float tattooReveal = 0.0;
          if (uProgress >= 1.0) {
            tattooReveal = 1.0;
          } else if (uProgress > 0.0) {
            float bleedNoise = tattooFbm(vMapUv * 15.0);
            float poreNoise = tattooFbm(vMapUv * 38.0 + vec2(17.3, 5.1));
            float inkEdge = uProgress
              + (bleedNoise - 0.5) * 0.12
              + (poreNoise - 0.5) * 0.035;
            float bleedWidth = mix(
              0.018,
              0.05,
              tattooFbm(vMapUv * 24.0 + vec2(3.7, 11.2))
            );
            tattooReveal = 1.0 - smoothstep(
              inkEdge - bleedWidth,
              inkEdge + bleedWidth * 0.35,
              vMapUv.x
            );
           }
           diffuseColor.a *= tattooReveal;
         #endif`,
      );
    },
    [reducedMotion],
  );

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uProgress.value = reducedMotion
        ? 1
        : useScrollStore.getState().progress;
    }
  });

  return (
    <meshPhysicalMaterial
      map={texture}
      roughness={0.88}
      metalness={0}
      clearcoat={0}
      alphaTest={0.4}
      transparent
      depthWrite={false}
      onBeforeCompile={onBeforeCompile}
      customProgramCacheKey={() => "tattoogo-scroll-tattoo-reveal"}
    />
  );
}

function SkinNormalMap({ mesh }: { mesh: Mesh }) {
  const texture = useTexture(SKIN_NORMAL_TEXTURE_PATH);
  const normalMap = useMemo(() => {
    const map = texture.clone();
    map.anisotropy = 4;
    map.needsUpdate = true;
    return map;
  }, [texture]);

  useEffect(() => () => normalMap.dispose(), [normalMap]);

  useLayoutEffect(() => {
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const previousSettings = materials.flatMap((material) => {
      if (!(material instanceof MeshStandardMaterial)) return [];

      const previousMap = material.normalMap;
      const previousScale = material.normalScale.clone();
      material.normalMap = normalMap;
      material.normalScale.set(0.8, 0.8);
      material.needsUpdate = true;
      return [{ material, previousMap, previousScale }];
    });

    return () => {
      for (const { material, previousMap, previousScale } of previousSettings) {
        material.normalMap = previousMap;
        material.normalScale.copy(previousScale);
        material.needsUpdate = true;
      }
    };
  }, [mesh, normalMap]);

  return null;
}

function getArmModel(scene: Group) {
  const model = scene.clone(true);
  let skinMesh: Mesh | null = null;
  let largestVolume = 0;

  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    object.castShadow = true;
    object.receiveShadow = true;
    object.geometry.computeBoundingBox();
    const bounds = object.geometry.boundingBox;
    if (!bounds) return;

    const size = bounds.getSize(new Vector3());
    const volume = size.x * size.y * size.z;
    if (volume > largestVolume) {
      largestVolume = volume;
      skinMesh = object;
    }
  });

  if (!skinMesh) {
    throw new Error("The arm GLB does not contain a mesh for the tattoo decal.");
  }

  const mesh = skinMesh as Mesh;
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  const matteMaterials = materials.map((material) => {
    if (!(material instanceof MeshStandardMaterial)) return material;

    const matteMaterial = material.clone();
    matteMaterial.color.set("#aa7957");
    matteMaterial.roughness = 0.65;
    matteMaterial.metalness = 0;
    if (matteMaterial instanceof MeshPhysicalMaterial) {
      matteMaterial.clearcoat = 0;
      matteMaterial.clearcoatRoughness = 1;
    }
    return matteMaterial;
  });
  mesh.material = Array.isArray(mesh.material)
    ? matteMaterials
    : matteMaterials[0];

  const bounds = mesh.geometry.boundingBox as Box3;
  const size = bounds.getSize(new Vector3());
  const dimensions = [size.x, size.y, size.z];
  const longitudinalAxis = dimensions.indexOf(Math.max(...dimensions));
  const surfaceAxis = dimensions.indexOf(Math.min(...dimensions));
  const tangent = new Vector3(
    longitudinalAxis === 0 ? 1 : 0,
    longitudinalAxis === 1 ? 1 : 0,
    longitudinalAxis === 2 ? 1 : 0,
  );
  const normal = new Vector3(
    surfaceAxis === 0 ? 1 : 0,
    surfaceAxis === 1 ? 1 : 0,
    surfaceAxis === 2 ? 1 : 0,
  );
  const decalUp = new Vector3().crossVectors(normal, tangent);
  const decalBasis = new Matrix4().makeBasis(tangent, decalUp, normal);
  const decalRotation = new Euler().setFromRotationMatrix(decalBasis);
  const decalPosition = bounds.getCenter(new Vector3()).addScaledVector(
    normal,
    dimensions[surfaceAxis] / 2,
  );
  const middleAxis = 3 - longitudinalAxis - surfaceAxis;
  const decalScale = new Vector3(
    dimensions[longitudinalAxis] * 0.58,
    dimensions[middleAxis] * 0.5,
    Math.max(dimensions[surfaceAxis] * 1.5, 0.025),
  );
  const modelBounds = new Box3().setFromObject(model);
  const modelCenter = modelBounds.getCenter(new Vector3());
  const modelSize = modelBounds.getSize(new Vector3());
  const modelScale = 4.2 / Math.max(modelSize.x, modelSize.y, modelSize.z, 0.001);
  model.position.sub(modelCenter);

  const modelRotation = new Euler().setFromRotationMatrix(
    decalBasis.clone().transpose(),
  );

  return {
    model,
    mesh,
    decalPosition,
    decalRotation,
    decalScale,
    modelScale,
    modelRotation,
    path: {
      mesh,
      center: decalPosition,
      tangent,
      normal,
      length: decalScale.x,
    },
  };
}

export default function InteractiveTattooArm({
  reducedMotion,
  pathRef,
}: {
  reducedMotion: boolean;
  pathRef: TattooPathRef;
}) {
  const { scene } = useGLTF(ARM_MODEL_PATH);
  const sourceTexture = useTexture(TATTOO_TEXTURE_PATH);
  const texture = useMemo(() => {
    const map = sourceTexture.clone();
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 4;
    map.needsUpdate = true;
    return map;
  }, [sourceTexture]);
  const { viewport } = useThree();
  const asset = useMemo(() => getArmModel(scene), [scene]);

  useLayoutEffect(() => {
    pathRef.current = asset.path;
    return () => {
      if (pathRef.current === asset.path) pathRef.current = null;
    };
  }, [asset, pathRef]);

  useEffect(() => () => texture.dispose(), [texture]);

  const armScale = Math.min(1, viewport.width / 6.5);

  return (
    <group
      position={[Math.min(viewport.width * 0.16, 2), -1.8, -0.55]}
      scale={armScale * asset.modelScale}
      rotation={asset.modelRotation}
    >
      <primitive object={asset.model} dispose={null} />
      <SkinNormalMap mesh={asset.mesh} />
      {createPortal(
        <Decal
          position={asset.decalPosition}
          rotation={asset.decalRotation}
          scale={asset.decalScale}
          map={texture}
          depthTest
          polygonOffsetFactor={-4}
        >
          <InkRevealMaterial texture={texture} reducedMotion={reducedMotion} />
        </Decal>,
        asset.mesh,
      )}
    </group>
  );
}

export function InteractiveTattooArmFallback({
  reducedMotion,
  pathRef,
}: {
  reducedMotion: boolean;
  pathRef: TattooPathRef;
}) {
  const armRef = useRef<Mesh>(null);
  const sourceTexture = useTexture(FALLBACK_TEXTURE_PATH);
  const texture = useMemo(() => {
    const map = sourceTexture.clone();
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = 4;
    map.needsUpdate = true;
    return map;
  }, [sourceTexture]);
  const invalidate = useThree((state) => state.invalidate);
  const { viewport } = useThree();

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useEffect(() => () => texture.dispose(), [texture]);

  useLayoutEffect(() => {
    const mesh = armRef.current;
    if (!mesh) return;

    const path = {
      mesh,
      center: new Vector3(0, 0, 0.385),
      tangent: new Vector3(0, 1, 0),
      normal: new Vector3(0, 0, 1),
      length: 0.88,
    };
    pathRef.current = path;
    invalidate();
    return () => {
      if (pathRef.current === path) pathRef.current = null;
    };
  }, [invalidate, pathRef]);

  const armScale = Math.min(1, viewport.width / 6.5);

  return (
    <group
      position={[Math.min(viewport.width * 0.16, 2), -1.8, -0.55]}
      scale={armScale}
      rotation={[0, 0, Math.PI / 2]}
    >
      <mesh ref={armRef} castShadow receiveShadow>
        <capsuleGeometry args={[0.39, 1.7, 8, 24]} />
        <meshPhysicalMaterial
          color="#b87960"
          roughness={0.78}
          metalness={0}
          clearcoat={0}
          clearcoatRoughness={0.9}
        />
        <Decal
          position={[0, 0, 0.385]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.88, 0.52, 0.16]}
          map={texture}
          depthTest
          polygonOffsetFactor={-4}
        >
          <InkRevealMaterial texture={texture} reducedMotion={reducedMotion} />
        </Decal>
      </mesh>
    </group>
  );
}
