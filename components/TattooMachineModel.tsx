"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
  type Material,
  type Object3D,
} from "three";

import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoomachine.glb";
const DRACO_DECODER_PATH = "/draco/";

useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);

export function MinimalMachineFallback() {
  return (
    <group scale={0.82}>
      <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, -0.22]}>
        <capsuleGeometry args={[0.34, 1.7, 8, 24]} />
        <meshStandardMaterial
          color="#303338"
          metalness={0.94}
          roughness={0.2}
        />
      </mesh>
      <mesh castShadow position={[0.04, -0.45, 0.28]}>
        <torusGeometry args={[0.38, 0.035, 10, 32]} />
        <meshStandardMaterial
          color="#FF6600"
          emissive="#FF6600"
          emissiveIntensity={0.45}
          metalness={0.9}
        />
      </mesh>
      <mesh castShadow position={[0, -1.22, 0]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.04, 0.13, 0.76, 16]} />
        <meshStandardMaterial
          color="#c8cbcc"
          metalness={0.98}
          roughness={0.12}
        />
      </mesh>
    </group>
  );
}

type TattooMachineModelProps = {
  reducedMotion: boolean;
};

function RealTattooMachineModel({
  reducedMotion,
}: TattooMachineModelProps) {
  const machineRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH);
  const { viewport } = useThree();

  useEffect(() => {
    let triangleCount = 0;
    let drawCallCount = 0;

    scene.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) return;

      drawCallCount += 1;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;
      if (object.geometry) {
        const position = object.geometry.getAttribute("position");
        if (position) {
          triangleCount += object.geometry.index
            ? object.geometry.index.count / 3
            : position.count / 3;
        }
      }
    });

    if (triangleCount > 50_000) {
      console.warn(
        `[TattooGo] Tattoo machine GLB has approximately ${Math.round(
          triangleCount,
        )} triangles. Run a Blender decimate or gltf-transform simplify pass before production.`,
      );
    }
    if (drawCallCount >= 100) {
      console.warn(
        `[TattooGo] Tattoo machine mesh contains ${drawCallCount} draw calls; merge static meshes for the <100 scene budget.`,
      );
    }

    return () => {
      scene.traverse((object: Object3D) => {
        if (!(object instanceof Mesh)) return;
        const geometry = object.geometry as BufferGeometry;
        geometry.dispose();

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material: Material) => {
          if (material instanceof MeshStandardMaterial) {
            material.map?.dispose();
            material.normalMap?.dispose();
            material.roughnessMap?.dispose();
            material.metalnessMap?.dispose();
            material.emissiveMap?.dispose();
          }
          material.dispose();
        });
      });
      useGLTF.clear(MODEL_PATH);
    };
  }, [scene]);

  useFrame((state, delta) => {
    const machine = machineRef.current;
    if (!machine || reducedMotion) return;

    const progress = useScrollStore.getState().progress;
    const horizontalAmplitude = Math.min(viewport.width * 0.16, 2.2);
    const targetX =
      Math.sin(progress * Math.PI * 4 + Math.PI / 2) * horizontalAmplitude;
    const targetY =
      Math.cos(progress * Math.PI * 2) * Math.min(viewport.height * 0.08, 0.75);
    machine.position.x = MathUtils.damp(
      machine.position.x,
      targetX,
      4,
      delta,
    );
    machine.position.y = MathUtils.damp(
      machine.position.y,
      targetY,
      4,
      delta,
    );
    machine.rotation.y = MathUtils.damp(
      machine.rotation.y,
      progress * Math.PI * 1.2,
      3,
      delta,
    );
    machine.rotation.z = MathUtils.damp(
      machine.rotation.z,
      -0.22 + progress * 0.12,
      3,
      delta,
    );

    void state;
  });

  const scale = Math.min(1.05, Math.max(0.52, viewport.width * 0.075));

  return (
    <group
      ref={machineRef}
      scale={scale}
      position={[0, reducedMotion ? 0.15 : 0, 0]}
      rotation={[0.08, 0, -0.22]}
    >
      <primitive object={scene} dispose={null} />
    </group>
  );
}

export default function TattooMachineModel({
  reducedMotion,
}: TattooMachineModelProps) {
  return <RealTattooMachineModel reducedMotion={reducedMotion} />;
}
