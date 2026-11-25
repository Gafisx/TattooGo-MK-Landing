"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Sparkles, useGLTF as useGLTFDRACO } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";
import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";
const NEEDLE_BASE_Y = -0.94;
const NEEDLE_LENGTH = 0.2;
const POSITION_EPSILON = 0.001;
const HERO_ROTATION = { x: 0.2, y: 0.3, z: -Math.PI / 4 } as const;

// Aponta para a pasta local do Draco (public/draco)
useGLTFDRACO.setDecoderPath('/draco/');
useGLTF.preload(MODEL_PATH);

// Fallback invisível: se o 3D falhar, o site não mostra o bloco preto
export function MinimalMachineFallback() {
  return null;
}

type TattooMachineModelProps = {
  reducedMotion: boolean;
  mode?: "hero" | "immersive";
};

export default function TattooMachineModel({
  reducedMotion,
  mode = "hero",
}: TattooMachineModelProps) {
  const machineRef = useRef<Group>(null);
  const needleRef = useRef<Group>(null);
  const isImmersiveMode = mode === "immersive";
  
  const { scene } = useGLTF(MODEL_PATH);
  const invalidate = useThree((s) => s.invalidate);
  
  // Lê o viewport dinâmico do View onde o componente está inserido
  const { viewport } = useThree(); 

  const fittedModel = useMemo(() => {
    const inst = scene.clone(true);
    inst.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(inst);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    inst.position.sub(center);
    // ESCALA REFINADA: diminui de 2 para 0.8 para parecer uma ferramenta real
    return { scene: inst, scale: 0.8 / Math.max(size.x, size.y, size.z, 0.001) };
  }, [scene]);

  useEffect(() => {
    if (reducedMotion || !isImmersiveMode) return;
    invalidate();
    return useScrollStore.subscribe((s, p) => { 
      if (s.immersiveProgress !== p.immersiveProgress || s.immersiveVisible !== p.immersiveVisible) {
        invalidate(); 
      }
    });
  }, [invalidate, isImmersiveMode, reducedMotion]);

  useFrame((state, delta) => {
    const machine = machineRef.current;
    if (!machine || reducedMotion) return;

    const { immersiveVisible, immersiveProgress } = useScrollStore.getState();
    const activeTattooing = isImmersiveMode && immersiveVisible;

    const targetX = activeTattooing
      ? MathUtils.lerp(-viewport.width * 0.4, viewport.width * 0.4, immersiveProgress)
      : 0;
    const targetY = activeTattooing ? 0.55 : 0;
    const targetRotX = activeTattooing ? 0.8 : HERO_ROTATION.x;
    const targetRotY = activeTattooing ? 0 : HERO_ROTATION.y;
    const targetRotZ = activeTattooing ? -Math.PI / 6 : HERO_ROTATION.z;

    machine.position.x = MathUtils.damp(machine.position.x, targetX, 8, delta);
    machine.position.y = MathUtils.damp(machine.position.y, targetY, 8, delta);
    machine.rotation.x = MathUtils.damp(machine.rotation.x, targetRotX, 8, delta);
    machine.rotation.y = MathUtils.damp(machine.rotation.y, targetRotY, 8, delta);
    machine.rotation.z = MathUtils.damp(machine.rotation.z, targetRotZ, 8, delta);

    if (needleRef.current) {
      const vibration = activeTattooing
        ? Math.sin(state.clock.elapsedTime * 150) * 0.03
        : 0;
      needleRef.current.position.y = NEEDLE_BASE_Y + vibration;
    }

    const needsMoreFrames =
      activeTattooing ||
      Math.abs(targetX - machine.position.x) > POSITION_EPSILON ||
      Math.abs(targetY - machine.position.y) > POSITION_EPSILON ||
      Math.abs(targetRotX - machine.rotation.x) > POSITION_EPSILON ||
      Math.abs(targetRotY - machine.rotation.y) > POSITION_EPSILON ||
      Math.abs(targetRotZ - machine.rotation.z) > POSITION_EPSILON;

    if (needsMoreFrames) {
      invalidate();
    }
  });

  const isTattooing = useScrollStore((s) => isImmersiveMode && s.immersiveVisible);

  return (
    <group ref={machineRef} scale={fittedModel.scale} position={[0, 0, 0]}>
      <primitive object={fittedModel.scene} dispose={null} />
      
      <group ref={needleRef} position={[0, NEEDLE_BASE_Y, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.02, 0.006, NEEDLE_LENGTH, 8]} />
          <meshPhysicalMaterial color="#d5d3cf" metalness={0.92} roughness={0.18} />
        </mesh>
        
        <group position={[0, -NEEDLE_LENGTH / 2, 0]}>
          {isTattooing && (
            <Sparkles 
              count={20} 
              scale={0.4} 
              size={1.5} 
              speed={0.4} 
              color="#FF6600" 
              opacity={0.8} 
            />
          )}
        </group>
      </group>
    </group>
  );
}