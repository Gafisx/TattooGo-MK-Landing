"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, MathUtils, Mesh, Quaternion, Vector3, type Object3D } from "three";

import { useScrollStore } from "@/components/scrollProgressStore";
import type { TattooPathRef } from "@/components/tattooPath";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";
const NEEDLE_BASE_Y = -0.94;
const NEEDLE_LENGTH = 0.2;
const NEEDLE_TIP_Y = NEEDLE_BASE_Y - NEEDLE_LENGTH / 2;

useGLTF.preload(MODEL_PATH);

// ... (Mantenha o MinimalMachineFallback igual) ...
export function MinimalMachineFallback() {
  return (
    <group scale={0.82}>
      <mesh castShadow position={[0, 0, 0]} rotation={[0, 0, -0.22]}>
        <capsuleGeometry args={[0.34, 1.7, 8, 24]} />
        <meshStandardMaterial color="#303338" metalness={0.94} roughness={0.2} />
      </mesh>
    </group>
  );
}

function RealTattooMachineModel({ reducedMotion, pathRef }: { reducedMotion: boolean; pathRef: TattooPathRef; }) {
  const machineRef = useRef<Group>(null);
  const needleRef = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const invalidate = useThree((s) => s.invalidate);
  
  const fittedModel = useMemo(() => {
    const inst = scene.clone(true); inst.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(inst);
    const size = bounds.getSize(new Vector3()); const center = bounds.getCenter(new Vector3());
    inst.position.sub(center);
    return { scene: inst, scale: 2 / Math.max(size.x, size.y, size.z, 0.001) };
  }, [scene]);

  const motion = useMemo(() => ({
    point: new Vector3(), normal: new Vector3(), needleDir: new Vector3(),
    targetPos: new Vector3(), currentPos: new Vector3(), parentLocalPoint: new Vector3(),
    targetRot: new Quaternion(), localTargetRot: new Quaternion(), parentWorldQuat: new Quaternion(),
    needleDown: new Vector3(0, -1, 0), needleTipWorld: new Vector3(),
  }), []);

  useEffect(() => {
    if (reducedMotion) return;
    return useScrollStore.subscribe((s, p) => { if (s.progress !== p.progress) invalidate(); });
  }, [invalidate, reducedMotion]);

  useFrame((state, delta) => {
    const machine = machineRef.current; const path = pathRef.current;
    if (!machine || !path) return;
    const parent = machine.parent;

    const progress = reducedMotion ? 1 : useScrollStore.getState().progress;
    motion.point.copy(path.center).addScaledVector(path.tangent, (progress - 0.5) * path.length);
    path.mesh.updateWorldMatrix(true, false);
    path.mesh.localToWorld(motion.point);
    motion.normal.copy(path.normal).transformDirection(path.mesh.matrixWorld);
    motion.needleDir.copy(motion.normal).negate();
    motion.targetRot.setFromUnitVectors(motion.needleDown, motion.needleDir);

    const rotDamp = reducedMotion ? 1 : 1 - Math.exp(-12 * delta);
    if (parent) {
      parent.updateWorldMatrix(true, false);
      parent.getWorldQuaternion(motion.parentWorldQuat).invert();
      motion.localTargetRot.copy(motion.targetRot).premultiply(motion.parentWorldQuat);
      machine.quaternion.slerp(motion.localTargetRot, rotDamp);
      motion.parentLocalPoint.copy(motion.point);
      parent.worldToLocal(motion.parentLocalPoint);
    } else {
      machine.quaternion.slerp(motion.targetRot, rotDamp);
      motion.parentLocalPoint.copy(motion.point);
    }

    motion.currentPos.copy(machine.position);
    machine.position.set(0, 0, 0);
    machine.updateMatrixWorld(true);
    motion.needleTipWorld.set(0, NEEDLE_TIP_Y, 0);
    machine.localToWorld(motion.needleTipWorld);
    if (parent) parent.worldToLocal(motion.needleTipWorld);
    motion.targetPos.copy(motion.parentLocalPoint).sub(motion.needleTipWorld);
    machine.position.copy(motion.currentPos);

    if (reducedMotion) {
      machine.position.copy(motion.targetPos);
    } else {
      machine.position.x = MathUtils.damp(machine.position.x, motion.targetPos.x, 12, delta);
      machine.position.y = MathUtils.damp(machine.position.y, motion.targetPos.y, 12, delta);
      machine.position.z = MathUtils.damp(machine.position.z, motion.targetPos.z, 12, delta);
    }

    if (Math.abs(machine.position.x - motion.targetPos.x) > 0.001) invalidate();

    if (reducedMotion) { if (needleRef.current) needleRef.current.position.y = NEEDLE_BASE_Y; return; }

    // MUDANÇA CRÍTICA: Vibração muito mais forte e rápida
    const isTattooing = progress > 0.05 && progress < 0.95;
    if (needleRef.current) {
      const vibration = isTattooing ? Math.sin(state.clock.elapsedTime * 80) * 0.05 : 0;
      needleRef.current.position.y = NEEDLE_BASE_Y + vibration;
    }
    if (isTattooing) invalidate();
  });

  return (
    <group ref={machineRef} scale={fittedModel.scale}>
      <primitive object={fittedModel.scene} dispose={null} />
      <group ref={needleRef} position={[0, NEEDLE_BASE_Y, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.006, NEEDLE_LENGTH, 8]} />
          <meshPhysicalMaterial color="#d5d3cf" metalness={0.92} roughness={0.18} />
        </mesh>
      </group>
    </group>
  );
}

export default function TattooMachineModel({ reducedMotion, pathRef }: { reducedMotion: boolean; pathRef: TattooPathRef; }) {
  return <RealTattooMachineModel reducedMotion={reducedMotion} pathRef={pathRef} />;
}
