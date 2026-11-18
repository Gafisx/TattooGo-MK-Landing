"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  Mesh,
  Quaternion,
  Vector3,
  type Object3D,
} from "three";

import { useScrollStore } from "@/components/scrollProgressStore";
import type { TattooPathRef } from "@/components/tattooPath";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";
const NEEDLE_BASE_Y = -0.94;
const NEEDLE_LENGTH = 0.14;
const NEEDLE_TIP_Y = NEEDLE_BASE_Y - NEEDLE_LENGTH / 2;
const NEEDLE_VIBRATION_AMPLITUDE = 0.004;
const NEEDLE_VIBRATION_FREQUENCY = 35;
const NEEDLE_VIBRATION_TAIL_MS = 180;

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

function RealTattooMachineModel({
  reducedMotion,
  pathRef,
}: {
  reducedMotion: boolean;
  pathRef: TattooPathRef;
}) {
  const machineRef = useRef<Group>(null);
  const needleRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const invalidate = useThree((state) => state.invalidate);
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
      scale: 1.6 / largestDimension,
    };
  }, [scene]);
  const motion = useMemo(
    () => ({
      point: new Vector3(),
      normal: new Vector3(),
      needleDirection: new Vector3(),
      targetPosition: new Vector3(),
      targetRotation: new Quaternion(),
      needleDown: new Vector3(0, -1, 0),
      needleTipWorld: new Vector3(),
    }),
    [],
  );
  const vibrationUntilRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;

    return useScrollStore.subscribe((state, previousState) => {
      if (state.progress === previousState.progress) return;

      vibrationUntilRef.current =
        performance.now() + NEEDLE_VIBRATION_TAIL_MS;
      invalidate();
    });
  }, [invalidate, reducedMotion]);

  useEffect(() => {
    let triangleCount = 0;
    let drawCallCount = 0;

    fittedModel.scene.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) return;

      drawCallCount += 1;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;
      const position = object.geometry.getAttribute("position");
      if (position) {
        triangleCount += object.geometry.index
          ? object.geometry.index.count / 3
          : position.count / 3;
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
  }, [fittedModel.scene]);

  useFrame((state) => {
    const machine = machineRef.current;
    const path = pathRef.current;
    if (!machine || !path) return;

    const progress = reducedMotion ? 1 : useScrollStore.getState().progress;
    motion.point
      .copy(path.center)
      .addScaledVector(path.tangent, (progress - 0.5) * path.length);
    path.mesh.updateWorldMatrix(true, false);
    path.mesh.localToWorld(motion.point);

    motion.normal
      .copy(path.normal)
      .transformDirection(path.mesh.matrixWorld);
    motion.needleDirection.copy(motion.normal).negate();
    motion.targetRotation.setFromUnitVectors(
      motion.needleDown,
      motion.needleDirection,
    );
    machine.position.copy(motion.point);
    machine.quaternion.copy(motion.targetRotation);
    machine.updateMatrixWorld(true);
    motion.needleTipWorld.set(0, NEEDLE_TIP_Y, 0);
    machine.localToWorld(motion.needleTipWorld);
    motion.targetPosition.copy(motion.point).sub(motion.needleTipWorld);
    machine.position.add(motion.targetPosition);

    if (reducedMotion) {
      if (needleRef.current) {
        needleRef.current.position.y = NEEDLE_BASE_Y;
      }
      return;
    }

    const isVibrating = performance.now() < vibrationUntilRef.current;

    if (needleRef.current) {
      const vibration = isVibrating
        ? Math.sin(
            state.clock.elapsedTime * Math.PI * 2 * NEEDLE_VIBRATION_FREQUENCY,
          ) * NEEDLE_VIBRATION_AMPLITUDE
        : 0;
      needleRef.current.position.y = NEEDLE_BASE_Y + vibration;
    }

    if (isVibrating) {
      invalidate();
    }
  });

  return (
    <group ref={machineRef} scale={fittedModel.scale}>
      <primitive object={fittedModel.scene} dispose={null} />
      <group ref={needleRef} position={[0, NEEDLE_BASE_Y, 0]}>
        <mesh castShadow>
          <cylinderGeometry
            args={[0.014, 0.004, NEEDLE_LENGTH, 8]}
          />
          <meshPhysicalMaterial
            color="#d5d3cf"
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function TattooMachineModel({
  reducedMotion,
  pathRef,
}: {
  reducedMotion: boolean;
  pathRef: TattooPathRef;
}) {
  return (
    <RealTattooMachineModel
      reducedMotion={reducedMotion}
      pathRef={pathRef}
    />
  );
}
