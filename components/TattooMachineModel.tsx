"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Sparkles, useGLTF as useGLTFDRACO } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";
import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";
const NEEDLE_BASE_Y = -0.94;
const NEEDLE_LENGTH = 0.2;

// Aponta para a pasta local do Draco (public/draco)
useGLTFDRACO.setDecoderPath('/draco/');
useGLTF.preload(MODEL_PATH);

// Fallback invisível: se o 3D falhar, o site não mostra o bloco preto
export function MinimalMachineFallback() {
  return null;
}

export default function TattooMachineModel({ reducedMotion }: { reducedMotion: boolean }) {
  const machineRef = useRef<Group>(null);
  const needleRef = useRef<Group>(null);
  
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
    if (reducedMotion) return;
    return useScrollStore.subscribe((s, p) => { 
      if (s.immersiveProgress !== p.immersiveProgress || s.immersiveVisible !== p.immersiveVisible) {
        invalidate(); 
      }
    });
  }, [invalidate, reducedMotion]);

  useFrame((state, delta) => {
    const machine = machineRef.current;
    if (!machine) return;

    const store = useScrollStore.getState();
    const { immersiveVisible, immersiveProgress } = store;

    if (!reducedMotion) {
      let targetX, targetY, targetRotX, targetRotY, targetRotZ, needleSpeed;

      if (immersiveVisible) {
        // --- MODO TATUAGEM (Na seção Imersiva) ---
        // A máquina desliza da esquerda para a direita dentro do View
        targetX = MathUtils.lerp(-viewport.width * 0.4, viewport.width * 0.4, immersiveProgress);
        
        // Posiciona a máquina ACIMA do texto e ajusta o ângulo da agulha
        targetY = 1.5; 
        targetRotX = 0.8; // Inclina para frente
        targetRotY = 0;   // De frente para a tela
        targetRotZ = -Math.PI / 6; // Leve inclinação para parecer natural
        needleSpeed = 150; 
      } else {
        // --- MODO FLUTUANTE (No Hero) ---
        // Fica no centro do View, com uma leve flutuação
        targetX = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        targetY = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
        targetRotX = 0.2;
        targetRotY = 0.3; 
        targetRotZ = -Math.PI / 4;
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
          ? Math.sin(state.clock.elapsedTime * needleSpeed) * 0.03 
          : 0;
        needleRef.current.position.y = NEEDLE_BASE_Y + vibration;
      }
    }

    invalidate();
  });

  const isTattooing = useScrollStore((s) => s.immersiveVisible);

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