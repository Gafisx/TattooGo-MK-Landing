"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Sparkles, useGLTF as useGLTFDRACO } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";
import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";
const NEEDLE_BASE_Y = -0.94;
const NEEDLE_LENGTH = 0.2;

// CORREÇÃO 1: Aponta para a pasta local do Draco (public/draco) para burlar o CSP
useGLTFDRACO.setDecoderPath('/draco/');
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
  
  const { scene } = useGLTF(MODEL_PATH);
  const invalidate = useThree((s) => s.invalidate);
  
  // CORREÇÃO 2: Mede o tamanho real da tela para calcular a distância no mobile
  const { viewport } = useThree(); 

  const fittedModel = useMemo(() => {
    const inst = scene.clone(true);
    inst.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(inst);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    inst.position.sub(center);
    return { scene: inst, scale: 2 / Math.max(size.x, size.y, size.z, 0.001) };
  }, [scene]);

  useEffect(() => {
    if (reducedMotion) return;
    return useScrollStore.subscribe((s, p) => { 
      if (s.progress !== p.progress || s.immersiveProgress !== p.immersiveProgress || s.immersiveVisible !== p.immersiveVisible) {
        invalidate(); 
      }
    });
  }, [invalidate, reducedMotion]);

  useFrame((state, delta) => {
    const machine = machineRef.current;
    if (!machine) return;

    const store = useScrollStore.getState();
    const { progress, immersiveVisible, immersiveProgress } = store;

    if (!reducedMotion) {
      let targetX, targetY, targetRotX, targetRotY, targetRotZ, needleSpeed;

      if (immersiveVisible) {
        // MODO TATUAGEM
        // CORREÇÃO 3: Usa o viewport.width para ir de ponta a ponta na tela do celular
        const maxX = viewport.width * 0.4; // 40% da tela para cada lado
        targetX = MathUtils.lerp(-maxX, maxX, immersiveProgress);
        
        targetY = 0; 
        targetRotX = 0.6; 
        targetRotY = -Math.PI / 2; 
        targetRotZ = 0;
        needleSpeed = 150; 
      } else {
        // MODO FLUTUANTE
        // Se estiver na área do carrossel ou longe do Hero, manda a máquina para baixo (invisível)
        const storeState = useScrollStore.getState();
        if (progress > 0.2 || storeState.artistsCarouselVisible) {
          targetY = -15; // Fica bem escondida
        } else {
          targetY = 2 - (progress * 4);
        }
        
        targetX = Math.sin(progress * Math.PI * 2) * 1.5;
        const hover = Math.sin(state.clock.elapsedTime * 3) * 0.05;
        targetY += hover;
        targetRotX = 0.2;
        targetRotY = 0;
        targetRotZ = targetX * 0.3;
        needleSpeed = 80;
      }

      machine.position.x = MathUtils.damp(machine.position.x, targetX, 8, delta);
      machine.position.y = MathUtils.damp(machine.position.y, targetY, 8, delta);
      machine.rotation.x = MathUtils.damp(machine.rotation.x, targetRotX, 8, delta);
      machine.rotation.y = MathUtils.damp(machine.rotation.y, targetRotY, 8, delta);
      machine.rotation.z = MathUtils.damp(machine.rotation.z, targetRotZ, 8, delta);

      if (needleRef.current) {
        const isTattooing = immersiveVisible;
        const vibration = isTattooing 
          ? Math.sin(state.clock.elapsedTime * needleSpeed) * 0.05 
          : 0;
        needleRef.current.position.y = NEEDLE_BASE_Y + vibration;
      }
    }

    invalidate();
  });

  const isTattooing = useScrollStore((s) => s.immersiveVisible);

  return (
    <>
      <group ref={machineRef} scale={fittedModel.scale}>
        <primitive object={fittedModel.scene} dispose={null} />
        <group ref={needleRef} position={[0, NEEDLE_BASE_Y, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.006, NEEDLE_LENGTH, 8]} />
            <meshPhysicalMaterial color="#d5d3cf" metalness={0.92} roughness={0.18} />
          </mesh>
          
          <group position={[0, -NEEDLE_LENGTH / 2, 0]}>
            {isTattooing && (
              <Sparkles 
                count={25} 
                scale={0.6} 
                size={2} 
                speed={0.5} 
                color="#FF6600" 
                opacity={0.9} 
              />
            )}
          </group>
        </group>
      </group>
    </>
  );
}