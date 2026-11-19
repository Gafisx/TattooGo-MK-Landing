"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Box3, Euler, Group, Matrix4, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, MathUtils, SRGBColorSpace, Vector3, type Texture } from "three";

import { useScrollStore } from "@/components/scrollProgressStore";
import type { TattooPathRef } from "@/components/tattooPath";

const ARM_MODEL_PATH = "/assets/models/arm_with_skin.glb";
// MUDANÇA CRÍTICA: Use PNG em vez de SVG. O Three.js odeia SVG.
const TATTOO_TEXTURE_PATH = "/assets/decals/star-tattoo.png"; 
const SKIN_NORMAL_TEXTURE_PATH = "/assets/textures/skin_normal.png";

// ... (Mantenha as funções getInkRevealProgress e configureInkRevealShader iguais) ...

export function getInkRevealProgress(reducedMotion: boolean) {
  return reducedMotion ? 1 : useScrollStore.getState().progress;
}

export function configureInkRevealShader(shader: any, reducedMotion: boolean) {
  shader.uniforms.uProgress = { value: getInkRevealProgress(reducedMotion) };
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `#include <common>
     uniform float uProgress;
     float tattooHash(vec2 point) { return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123); }
     float tattooNoise(vec2 point) {
       vec2 cell = floor(point); vec2 local = fract(point);
       local = local * local * (3.0 - 2.0 * local);
       return mix(mix(tattooHash(cell), tattooHash(cell + vec2(1.0, 0.0)), local.x), mix(tattooHash(cell + vec2(0.0, 1.0)), tattooHash(cell + vec2(1.0, 1.0)), local.x), local.y);
     }
     float tattooFbm(vec2 point) {
       float value = 0.0; float amplitude = 0.5;
       for (int i = 0; i < 4; i++) { value += amplitude * tattooNoise(point); point = point * 2.0 + vec2(13.1, 7.7); amplitude *= 0.5; }
       return value;
     }`
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <map_fragment>",
    `#include <map_fragment>
     #ifdef USE_MAP
      float tattooReveal = 0.0;
      if (uProgress >= 1.0) { tattooReveal = 1.0; } 
      else if (uProgress > 0.0) {
        float bleed = tattooFbm(vMapUv * 15.0);
        float edge = uProgress + (bleed - 0.5) * 0.12;
        tattooReveal = 1.0 - smoothstep(edge - 0.05, edge + 0.02, vMapUv.x);
       }
       diffuseColor.a *= tattooReveal;
     #endif`
  );
}

export function updateInkRevealUniform(shader: any, reducedMotion: boolean, delta?: number) {
  const p = shader.uniforms.uProgress;
  if (!p) return;
  const target = getInkRevealProgress(reducedMotion);
  p.value = (reducedMotion || delta === undefined) ? target : MathUtils.damp(p.value, target, 12, delta);
}

function InkRevealMaterial({ texture, reducedMotion }: { texture: Texture; reducedMotion: boolean }) {
  const shaderRef = useRef<any>(null);
  const invalidate = useThree((s) => s.invalidate);

  const onBeforeCompile = useCallback((shader: any) => {
    configureInkRevealShader(shader, reducedMotion);
    shaderRef.current = shader;
  }, [reducedMotion]);

  useEffect(() => {
    invalidate();
    return useScrollStore.subscribe((s, p) => { if (s.progress !== p.progress) invalidate(); });
  }, [invalidate]);

  useFrame((_, delta) => {
    if (shaderRef.current) {
      updateInkRevealUniform(shaderRef.current, reducedMotion, delta);
      if (Math.abs(shaderRef.current.uniforms.uProgress.value - getInkRevealProgress(false)) > 0.001) invalidate();
    }
  });

  return (
    <meshPhysicalMaterial
      map={texture}
      roughness={0.88}
      metalness={0}
      alphaTest={0.1} // MUDANÇA: Diminuído de 0.4 para 0.1 para não apagar o traço
      transparent
      depthWrite={false}
      onBeforeCompile={onBeforeCompile}
      customProgramCacheKey={() => "tattoogo-scroll-tattoo-reveal"}
    />
  );
}

// ... (Mantenha o SkinNormalMap igual) ...
function SkinNormalMap({ mesh }: { mesh: Mesh }) {
  const texture = useTexture(SKIN_NORMAL_TEXTURE_PATH);
  const normalMap = useMemo(() => { const m = texture.clone(); m.anisotropy = 4; m.needsUpdate = true; return m; }, [texture]);
  useEffect(() => () => normalMap.dispose(), [normalMap]);
  useLayoutEffect(() => {
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const prev = mats.flatMap((mat) => {
      if (!(mat instanceof MeshStandardMaterial)) return [];
      const pMap = mat.normalMap; const pScale = mat.normalScale.clone();
      mat.normalMap = normalMap; mat.normalScale.set(0.8, 0.8); mat.needsUpdate = true;
      return [{ material: mat, pMap, pScale }];
    });
    return () => prev.forEach(({ material, pMap, pScale }) => { material.normalMap = pMap; material.normalScale.copy(pScale); material.needsUpdate = true; });
  }, [mesh, normalMap]);
  return null;
}

// ... (Mantenha a função getArmModel, mas REMOVA a linha que força a cor!) ...
function getArmModel(scene: Group) {
  const model = scene.clone(true);
  let skinMesh: Mesh | null = null;
  let largestVolume = 0;

  model.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    obj.castShadow = true; obj.receiveShadow = true;
    obj.geometry.computeBoundingBox();
    const bounds = obj.geometry.boundingBox;
    if (!bounds) return;
    const size = bounds.getSize(new Vector3());
    const volume = size.x * size.y * size.z;
    if (volume > largestVolume) { largestVolume = volume; skinMesh = obj; }
  });

  if (!skinMesh) throw new Error("Arm GLB missing mesh.");
  const mesh = skinMesh as Mesh;
  
  // REMOVIDO: O código que forçava a cor "#aa7957" foi deletado.
  // Agora o braço vai usar a textura original do GLB.
  
  const bounds = mesh.geometry.boundingBox as Box3;
  const size = bounds.getSize(new Vector3());
  const dim = [size.x, size.y, size.z];
  const longAxis = dim.indexOf(Math.max(...dim));
  const surfAxis = dim.indexOf(Math.min(...dim));
  const tangent = new Vector3(longAxis === 0 ? 1 : 0, longAxis === 1 ? 1 : 0, longAxis === 2 ? 1 : 0);
  const normal = new Vector3(surfAxis === 0 ? 1 : 0, surfAxis === 1 ? 1 : 0, surfAxis === 2 ? 1 : 0);
  const up = new Vector3().crossVectors(normal, tangent);
  const basis = new Matrix4().makeBasis(tangent, up, normal);
  const rot = new Euler().setFromRotationMatrix(basis);
  const pos = bounds.getCenter(new Vector3()).addScaledVector(normal, dim[surfAxis] / 2);
  const midAxis = 3 - longAxis - surfAxis;
  const decalScale = new Vector3(dim[longAxis] * 0.58, dim[midAxis] * 0.5, Math.max(dim[surfAxis] * 1.5, 0.025));
  
  const modelBounds = new Box3().setFromObject(model);
  const center = modelBounds.getCenter(new Vector3());
  const mSize = modelBounds.getSize(new Vector3());
  const scale = 4.2 / Math.max(mSize.x, mSize.y, mSize.z, 0.001);
  model.position.sub(center);
  const modelRot = new Euler().setFromRotationMatrix(basis.clone().transpose());

  return { model, mesh, decalPosition: pos, decalRotation: rot, decalScale, modelScale: scale, modelRotation: modelRot, path: { mesh, center: pos, tangent, normal, length: decalScale.x } };
}

export default function InteractiveTattooArm({ reducedMotion, pathRef }: { reducedMotion: boolean; pathRef: TattooPathRef; }) {
  const { scene } = useGLTF(ARM_MODEL_PATH);
  const sourceTexture = useTexture(TATTOO_TEXTURE_PATH);
  const texture = useMemo(() => {
    const map = sourceTexture.clone();
    map.colorSpace = SRGBColorSpace; map.anisotropy = 4; map.needsUpdate = true; return map;
  }, [sourceTexture]);
  const { viewport } = useThree();
  const asset = useMemo(() => getArmModel(scene), [scene]);

  useLayoutEffect(() => {
    pathRef.current = asset.path;
    return () => { if (pathRef.current === asset.path) pathRef.current = null; };
  }, [asset, pathRef]);

  useEffect(() => () => texture.dispose(), [texture]);
  const armScale = Math.min(1, viewport.width / 6.5);

  return (
    <group position={[Math.min(viewport.width * 0.16, 2), -1.8, -0.55]} scale={armScale * asset.modelScale} rotation={asset.modelRotation}>
      <primitive object={asset.model} dispose={null} />
      <SkinNormalMap mesh={asset.mesh} />
      {createPortal(
        <Decal position={asset.decalPosition} rotation={asset.decalRotation} scale={asset.decalScale} map={texture} depthTest polygonOffsetFactor={-4}>
          <InkRevealMaterial texture={texture} reducedMotion={reducedMotion} />
        </Decal>,
        asset.mesh
      )}
    </group>
  );
}

// ... (Mantenha o InteractiveTattooArmFallback igual) ...
export function InteractiveTattooArmFallback({ reducedMotion, pathRef }: { reducedMotion: boolean; pathRef: TattooPathRef; }) {
  // ... (Mantenha igual ao seu arquivo original) ...
  return null; // (Apenas cole o original aqui para economizar espaço, eu não mudei)
}
