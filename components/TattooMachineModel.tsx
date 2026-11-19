"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Trail } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";

import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";
const NEEDLE_BASE_Y = -0.94;
const NEEDLE_LENGTH = 0.2;
const NEEDLE_TIP_Y = NEEDLE_BASE_Y - NEEDLE_LENGTH / 2;

useGLTF.preload(MODEL_PATH);

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

export default function TattooMachineModel({ reducedMotion }: { reducedMotion: boolean }) {
  const machineRef = useRef<Group>(null);
  const needleRef = useRef<Group>(null);
  const trailTargetRef = useRef<Group>(null); // Objeto que a linha vai seguir
  const { scene } = useGLTF(MODEL_PATH);
  const invalidate = useThree((s) => s.invalidate);
  
  const fittedModel = useMemo(() => {
    const inst = scene.clone(true); inst.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(inst);
    const size = bounds.getSize(new Vector3()); const center = bounds.getCenter(new Vector3());
    inst.position.sub(center);
    return { scene: inst, scale: 2 / Math.max(size.x, size.y, size.z, 0.001) };
  }, [scene]);

  useEffect(() => {
    if (reducedMotion) return;
    return useScrollStore.subscribe((s, p) => { if (s.progress !== p.progress) invalidate(); });
  }, [invalidate, reducedMotion]);

  useFrame((state, delta) => {
    const machine = machineRef.current;
    if (!machine) return;

    const progress = reducedMotion ? 1 : useScrollStore.getState().progress;
    
    // A máquina flutua pela tela baseada no scroll
    const targetY = 2 - (progress * 4); // Vai do topo (2) ao fundo (-2)
    const targetX = Math.sin(progress * Math.PI * 2) * 1.5; // Faz um movimento de onda (S)
    
    // Efeito de respiração (hover)
    const hover = Math.sin(state.clock.elapsedTime * 3) * 0.05;

    // Atualiza a posição da máquina
    machine.position.x = MathUtils.damp(machine.position.x, targetX, 8, delta);
    machine.position.y = MathUtils.damp(machine.position.y, targetY + hover, 8, delta);
    
    // Inclina a máquina levemente para acompanhar a curva
    machine.rotation.z = MathUtils.damp(machine.rotation.z, targetX * 0.3, 8, delta);
    machine.rotation.x = MathUtils.damp(machine.rotation.x, 0.2, 8, delta); // Levemente deitada para frente

    // Vibração da agulha
    if (needleRef.current) {
      const isTattooing = progress > 0.05 && progress < 0.95;
      const vibration = isTattooing && !reducedMotion 
        ? Math.sin(state.clock.elapsedTime * 80) * 0.05 
        : 0;
      needleRef.current.position.y = NEEDLE_BASE_Y + vibration;
    }

    // Atualiza o rastro de tinta (Trail) para seguir a ponta da agulha
    if (trailTargetRef.current && machineRef.current) {
        machineRef.current.updateMatrixWorld();
        trailTargetRef.current.position.set(0, NEEDLE_TIP_Y, 0);
        machineRef.current.localToWorld(trailTargetRef.current.position);
    }

    invalidate(); // Como a máquina está sempre "respirando", precisamos renderizar sempre
  });

  return (
    <>
      <group ref={machineRef} scale={fittedModel.scale}>
        <primitive object={fittedModel.scene} dispose={null} />
        <group ref={needleRef} position={[0, NEEDLE_BASE_Y, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.006, NEEDLE_LENGTH, 8]} />
            <meshPhysicalMaterial color="#d5d3cf" metalness={0.92} roughness={0.18} />
          </mesh>
        </group>
      </group>

      {/* Rastro de Tinta Neon (O que a máquina está desenhando na tela) */}
      <Trail
        width={0.5}
        length={6}
        color={"#FF6600"}
        attenuation={(t) => t * t}
      >
        <mesh ref={trailTargetRef} />
      </Trail>
    </>
  );
}
