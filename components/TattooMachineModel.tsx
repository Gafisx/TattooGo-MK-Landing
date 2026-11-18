"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  MathUtils,
  Mesh,
  type Object3D,
  Vector3,
} from "three";

import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";

useGLTF.preload(MODEL_PATH);

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

function NeedleVibration({ reducedMotion }: { reducedMotion: boolean }) {
  const needleRef = useRef<Group>(null);
  const isDrawing = useScrollStore((state) => state.isDrawing);
  const { invalidate } = useThree();
  const baseY = -0.94;

  // The GLB has generic Object_* meshes, not a separately named needle; keep
  // this lightweight contact pin independent of the cached model geometry.
  useFrame(({ clock }) => {
    const needle = needleRef.current;
    if (!needle) return;

    needle.position.y = baseY;
    if (reducedMotion || !isDrawing) return;

    needle.position.y += Math.sin(clock.elapsedTime * 120) * 0.002;
    invalidate();
  });

  return (
    <group ref={needleRef} position={[0, baseY, 0.08]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.004, 0.014, 0.14, 8]} />
        <meshPhysicalMaterial
          color="#d5d3cf"
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
}

function RealTattooMachineModel({
  reducedMotion,
}: TattooMachineModelProps) {
  const machineRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const { invalidate, viewport } = useThree();
  const fittedModel = useMemo(() => {
    const instance = scene.clone(true);
    instance.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(instance);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.001);

    instance.position.sub(center);

    return {
      scene: instance,
      scale: 3.2 / largestDimension,
    };
  }, [scene]);

  useEffect(() => {
    let triangleCount = 0;
    let drawCallCount = 0;

    fittedModel.scene.traverse((object: Object3D) => {
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

    // The GLTF cache owns shared geometries/materials; dispose={null} preserves them for remounts.
  }, [fittedModel.scene]);

  useFrame((_state, delta) => {
    const machine = machineRef.current;
    const { progress, pointer, isDrawing } = useScrollStore.getState();
    if (!machine || reducedMotion) return;

    const compactViewport = viewport.width < 6;
    const baseX = Math.min(
      viewport.width * (compactViewport ? 0.16 : 0.24),
      2.6,
    );
    const baseY = compactViewport ? -2.45 : 0;
    const travelAmplitude = Math.min(
      viewport.width * (compactViewport ? 0.06 : 0.12),
      1.5,
    );
    const targetX = isDrawing
      ? (pointer.x - 0.5) * viewport.width
      : baseX +
        Math.sin(progress * Math.PI * 6 + Math.PI / 2) * travelAmplitude;
    const targetY = isDrawing
      ? (0.5 - pointer.y) * viewport.height
      : baseY +
        Math.sin(progress * Math.PI * 6) * (compactViewport ? 0.16 : 0.55);
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

    if (
      Math.abs(machine.position.x - targetX) > 0.001 ||
      Math.abs(machine.position.y - targetY) > 0.001 ||
      Math.abs(machine.rotation.y - progress * Math.PI * 1.2) > 0.001 ||
      Math.abs(machine.rotation.z - (-0.22 + progress * 0.12)) > 0.001
    ) {
      invalidate();
    }
  });

  return (
    <group
      ref={machineRef}
      scale={fittedModel.scale * Math.min(1, viewport.width / 6.5)}
      position={[
        Math.min(viewport.width * (viewport.width < 6 ? 0.16 : 0.24), 2.6),
        viewport.width < 6 ? -2.45 : 0,
        0,
      ]}
      rotation={[0.08, 0, -0.22]}
    >
      <primitive object={fittedModel.scene} dispose={null} />
      <NeedleVibration reducedMotion={reducedMotion} />
    </group>
  );
}

export default function TattooMachineModel({
  reducedMotion,
}: TattooMachineModelProps) {
  return <RealTattooMachineModel reducedMotion={reducedMotion} />;
}
