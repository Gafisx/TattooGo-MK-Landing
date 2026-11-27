"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import { Box3, Group, MathUtils, Vector3 } from "three";
import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";

/** Altura da máquina no hero, em unidades de mundo. */
const HERO_MODEL_SIZE = 0.8;

const HERO_ROTATION = { x: 0.2, y: 0.3, z: -Math.PI / 4 } as const;
const IMMERSIVE_ROTATION = { x: 0.8, y: 0, z: -Math.PI / 6 } as const;

/** Tolerância de convergência do damping para parar de pedir frames. */
const POSITION_EPSILON = 0.002;

/** Comprimento da agulha/sonda em relação à altura da máquina. */
const NEEDLE_LENGTH_RATIO = 0.09;

/** Altura alvo da máquina na seção imersiva, relativa à altura da frase. */
const IMMERSIVE_HEIGHT_FROM_TEXT = 2;
const IMMERSIVE_MIN_HEIGHT_FROM_TEXT = 0.9;
const IMMERSIVE_MAX_HEIGHT_FROM_TEXT = 2.6;
/** Folga entre o topo da máquina e a borda do View (proporção do espaço livre). */
const IMMERSIVE_CEILING_FILL = 0.88;

// Aponta para a pasta local do Draco (public/draco).
// O GLB é carregado pelo `useGLTF` quando a View monta (o drei cacheia o
// resultado), sem disparar I/O no import do módulo.
useGLTF.setDecoderPath("/draco/");

type TattooMachineModelProps = {
  reducedMotion: boolean;
  mode?: "hero" | "immersive";
  /**
   * Altura da linha de topo dos glifos, em fração da altura do viewport 3D
   * (0 = centro). Mantém a ponta da agulha tocando a frase.
   */
  needleYFraction?: number;
  /**
   * Altura renderizada da frase como fração da caixa do View. Define o
   * tamanho da máquina de forma previsível em qualquer breakpoint.
   */
  textHeightFraction?: number;
};

export default function TattooMachineModel({
  reducedMotion,
  mode = "hero",
  needleYFraction = 0,
  textHeightFraction = 0.2,
}: TattooMachineModelProps) {
  const machineRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const tipRef = useRef<Group>(null);
  const needleRef = useRef<Group>(null);

  const scaleRef = useRef<number | null>(null);
  const tipGoalRef = useRef({ x: 0, y: 0 });
  const tipWorldRef = useRef(new Vector3());

  const isImmersiveMode = mode === "immersive";

  const { scene } = useGLTF(MODEL_PATH);
  const invalidate = useThree((s) => s.invalidate);

  // Lê o viewport dinâmico do View onde o componente está inserido
  const { viewport } = useThree();

  const fittedModel = useMemo(() => {
    const instance = scene.clone(true);
    instance.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(instance);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    instance.position.sub(center);

    const height = Math.max(size.y, 0.0001);
    const longest = Math.max(size.x, size.y, size.z, 0.0001);

    return { scene: instance, height, heroScale: HERO_MODEL_SIZE / longest };
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
    const body = bodyRef.current;
    const tip = tipRef.current;
    const needle = needleRef.current;
    if (!machine || !body || !tip || !needle) return;

    const { immersiveVisible, immersiveProgress } = useScrollStore.getState();
    const tattooing = isImmersiveMode && !reducedMotion && immersiveVisible;

    // Escala responsiva derivada da frase medida: a máquina acompanha a
    // tipografia e nunca passa da borda superior do View.
    let targetScale = fittedModel.heroScale;
    if (isImmersiveMode) {
      const textHeight = Math.max(textHeightFraction, 0.01) * viewport.height;
      const ceiling = Math.max(0, 0.5 - needleYFraction) * viewport.height * IMMERSIVE_CEILING_FILL;
      const minTarget = textHeight * IMMERSIVE_MIN_HEIGHT_FROM_TEXT;
      const maxTarget = Math.max(
        minTarget,
        Math.min(ceiling, textHeight * IMMERSIVE_MAX_HEIGHT_FROM_TEXT),
      );
      const targetHeight = MathUtils.clamp(
        textHeight * IMMERSIVE_HEIGHT_FROM_TEXT,
        minTarget,
        maxTarget,
      );
      targetScale = targetHeight / fittedModel.height;
    }

    const previousScale = scaleRef.current ?? targetScale;
    const currentScale = MathUtils.damp(previousScale, targetScale, 6, delta);
    scaleRef.current = currentScale;
    body.scale.setScalar(currentScale);

    const worldHeight = fittedModel.height * currentScale;
    const needleLength = worldHeight * NEEDLE_LENGTH_RATIO;

    // A âncora fica na ponta real da agulha; o corpo cresce para cima.
    tip.position.y = -worldHeight / 2 - needleLength;
    needle.scale.set(worldHeight * 0.05, needleLength, worldHeight * 0.05);
    needle.position.y =
      needleLength / 2 +
      (tattooing ? Math.sin(state.clock.elapsedTime * 150) * worldHeight * 0.008 : 0);

    const progress = Math.min(1, Math.max(0, immersiveProgress));
    const targetTipX = tattooing ? (progress - 0.5) * viewport.width : 0;
    const targetTipY = tattooing ? needleYFraction * viewport.height : -worldHeight / 2 - needleLength;

    tipGoalRef.current.x = MathUtils.damp(tipGoalRef.current.x, targetTipX, 14, delta);
    tipGoalRef.current.y = MathUtils.damp(tipGoalRef.current.y, targetTipY, 10, delta);

    const targetRotation = tattooing ? IMMERSIVE_ROTATION : HERO_ROTATION;
    machine.rotation.x = MathUtils.damp(machine.rotation.x, targetRotation.x, 8, delta);
    machine.rotation.y = MathUtils.damp(machine.rotation.y, targetRotation.y, 8, delta);
    machine.rotation.z = MathUtils.damp(machine.rotation.z, targetRotation.z, 8, delta);

    // Corrige a translação para que a ponta (já rotacionada) caia exatamente
    // sobre a borda revelada da frase.
    const tipWorld = tipWorldRef.current;
    tip.getWorldPosition(tipWorld);
    machine.position.x += tipGoalRef.current.x - tipWorld.x;
    machine.position.y += tipGoalRef.current.y - tipWorld.y;

    const settled =
      !tattooing &&
      Math.abs(targetScale - currentScale) < POSITION_EPSILON &&
      Math.abs(targetRotation.x - machine.rotation.x) < POSITION_EPSILON &&
      Math.abs(targetRotation.y - machine.rotation.y) < POSITION_EPSILON &&
      Math.abs(targetRotation.z - machine.rotation.z) < POSITION_EPSILON &&
      Math.abs(targetTipX - tipGoalRef.current.x) < POSITION_EPSILON &&
      Math.abs(targetTipY - tipGoalRef.current.y) < POSITION_EPSILON;

    if (tattooing || !settled) {
      invalidate();
    }
  });

  const isTattooing = useScrollStore((s) => isImmersiveMode && s.immersiveVisible);

  return (
    <group
      ref={machineRef}
      position={[0, 0, 0]}
      rotation={[HERO_ROTATION.x, HERO_ROTATION.y, HERO_ROTATION.z]}
    >
      <group ref={bodyRef} scale={fittedModel.heroScale}>
        <primitive object={fittedModel.scene} dispose={null} />
      </group>

      <group ref={tipRef} position={[0, 0, 0]}>
        <group ref={needleRef} position={[0, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.35, 0.08, 1, 10]} />
            <meshPhysicalMaterial
              color="#d5d3cf"
              metalness={0.92}
              roughness={0.18}
              emissive="#FF6600"
              emissiveIntensity={0.25}
            />
          </mesh>
        </group>

        {isTattooing && (
          <Sparkles count={20} scale={0.4} size={1.5} speed={0.4} color="#FF6600" opacity={0.8} />
        )}
      </group>
    </group>
  );
}
