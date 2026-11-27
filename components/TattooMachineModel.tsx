"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useScrollStore } from "@/components/scrollProgressStore";

const MODEL_PATH = "/assets/models/tattoo-machine.glb";

/** Altura da máquina no hero, em unidades de mundo. */
const HERO_MODEL_SIZE = 0.8;

const HERO_ROTATION = { x: 0.2, y: 0.3, z: -Math.PI / 4 } as const;
const IMMERSIVE_ROTATION = { x: 0.8, y: 0, z: -Math.PI / 6 } as const;

/** Tolerância de convergência do damping para parar de pedir frames. */
const POSITION_EPSILON = 0.002;

/** Comprimento visível da agulha em relação à altura da máquina. */
const NEEDLE_LENGTH_RATIO = 0.12;
/** Quanto a agulha penetra no corpo, eliminando qualquer fresta no encaixe. */
const NEEDLE_OVERLAP_RATIO = 0.02;

/**
 * A agulha é montada num grupo com escala uniforme (`worldHeight`), então cada
 * medida abaixo já é uma fração da altura da máquina — assim ponta, haste e
 * encaixe mantêm a proporção real em qualquer tela.
 */
const NEEDLE_TIP_HEIGHT = 0.035;
const NEEDLE_TIP_RADIUS = 0.006;
const NEEDLE_SHAFT_RADIUS = 0.0045;
const NEEDLE_COLLET_RADIUS = 0.012;
const NEEDLE_COLLET_HEIGHT = 0.03;
const NEEDLE_TOTAL_HEIGHT = NEEDLE_LENGTH_RATIO + NEEDLE_OVERLAP_RATIO;
const NEEDLE_SHAFT_HEIGHT = NEEDLE_TOTAL_HEIGHT - NEEDLE_TIP_HEIGHT;
const NEEDLE_COLLET_BASE = NEEDLE_TOTAL_HEIGHT - NEEDLE_COLLET_HEIGHT;

/** Altura alvo da máquina na seção imersiva, relativa à altura da frase. */
const IMMERSIVE_HEIGHT_FROM_TEXT = 2;
const IMMERSIVE_MIN_HEIGHT_FROM_TEXT = 0.9;
const IMMERSIVE_MAX_HEIGHT_FROM_TEXT = 2.6;
/** Folga entre o topo da máquina e a borda do View (proporção do espaço livre). */
const IMMERSIVE_CEILING_FILL = 0.88;

/**
 * O fundo da seção é quase preto, então uma sombra projetada num piso some.
 * O que dá volume e separa a máquina do fundo é o halo de luz de estúdio:
 * um plano billboard aditivo, gerado uma vez em canvas.
 */
const GLOW_SIZE_FROM_MACHINE = 2.2;
/** Profundidade do halo atrás do corpo. */
const GLOW_DEPTH = -1.2;

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

type ImmersiveHeightInput = {
  textHeightFraction: number;
  needleYFraction: number;
  viewportHeight: number;
};

/**
 * Altura da máquina na seção imersiva: acompanha a tipografia medida e é
 * limitada pelo espaço livre até a borda superior do View. É a mesma regra
 * usada no frame e no render (sombra/partículas), para nunca divergirem.
 */
function resolveImmersiveHeight({
  textHeightFraction,
  needleYFraction,
  viewportHeight,
}: ImmersiveHeightInput) {
  const textHeight = Math.max(textHeightFraction, 0.01) * viewportHeight;
  const ceiling = Math.max(0, 0.5 - needleYFraction) * viewportHeight * IMMERSIVE_CEILING_FILL;
  const minTarget = textHeight * IMMERSIVE_MIN_HEIGHT_FROM_TEXT;
  const maxTarget = Math.max(
    minTarget,
    Math.min(ceiling, textHeight * IMMERSIVE_MAX_HEIGHT_FROM_TEXT),
  );
  const height = MathUtils.clamp(textHeight * IMMERSIVE_HEIGHT_FROM_TEXT, minTarget, maxTarget);
  // O corpo mais a agulha é que precisam caber no espaço livre.
  const ceilingForBody = ceiling / (1 + NEEDLE_LENGTH_RATIO);
  return Math.max(minTarget, Math.min(height, ceilingForBody));
}

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
  const glowRef = useRef<Mesh>(null);

  const scaleRef = useRef<number | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const tipWorldRef = useRef(new Vector3());
  const targetWorldRef = useRef(new Vector3());

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

  const isTattooing = useScrollStore((s) => isImmersiveMode && s.immersiveVisible);

  // Tamanho de referência da máquina no render: acompanha a frase medida para
  // sombra e partículas ficarem sempre proporcionais ao corpo.
  const referenceHeight = isImmersiveMode
    ? resolveImmersiveHeight({
        textHeightFraction,
        needleYFraction,
        viewportHeight: viewport.height,
      })
    : HERO_MODEL_SIZE;

  // Halo de estúdio gerado uma única vez. Sem `document` (SSR) fica nulo e o
  // plano simplesmente não é montado — a cena 3D só existe no cliente.
  const glowTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,102,0,0.5)");
    gradient.addColorStop(0.4, "rgba(255,102,0,0.16)");
    gradient.addColorStop(1, "rgba(255,102,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => () => glowTexture?.dispose(), [glowTexture]);

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
      targetScale =
        resolveImmersiveHeight({
          textHeightFraction,
          needleYFraction,
          viewportHeight: viewport.height,
        }) / fittedModel.height;
    }

    const previousScale = scaleRef.current ?? targetScale;
    const currentScale = MathUtils.damp(previousScale, targetScale, 6, delta);
    scaleRef.current = currentScale;
    body.scale.setScalar(currentScale);

    const worldHeight = fittedModel.height * currentScale;
    const needleLength = worldHeight * NEEDLE_LENGTH_RATIO;

    // A âncora fica na ponta real da agulha; o corpo cresce para cima.
    tip.position.y = -worldHeight / 2 - needleLength;
    needle.scale.setScalar(worldHeight);
    needle.position.y = tattooing ? Math.sin(state.clock.elapsedTime * 150) * worldHeight * 0.004 : 0;

    const targetRotation = tattooing ? IMMERSIVE_ROTATION : HERO_ROTATION;
    machine.rotation.x = MathUtils.damp(machine.rotation.x, targetRotation.x, 8, delta);
    machine.rotation.y = MathUtils.damp(machine.rotation.y, targetRotation.y, 8, delta);
    machine.rotation.z = MathUtils.damp(machine.rotation.z, targetRotation.z, 8, delta);

    const progress = Math.min(1, Math.max(0, immersiveProgress));
    const camera = state.camera;
    const tipWorld = tipWorldRef.current;
    const targetWorld = targetWorldRef.current;
    tip.getWorldPosition(tipWorld);

    if (tattooing) {
      // A ponta vive em z ≠ 0 (o corpo é inclinado), então a fração de tela
      // vira um ponto no plano de profundidade dela. Sem isso a perspectiva
      // puxa a agulha para o centro e ela se descola da borda revelada.
      // `viewport` é medido no plano z = 0; a ponta fica atrás dele, então a
      // meia-largura visível cresce na proporção da distância à câmera.
      let halfWidth = viewport.width / 2;
      let halfHeight = viewport.height / 2;
      if (camera instanceof PerspectiveCamera) {
        const cameraDepth = Math.max(0.001, Math.abs(camera.position.z));
        const depthScale = Math.max(0.001, cameraDepth - tipWorld.z) / cameraDepth;
        halfWidth *= depthScale;
        halfHeight *= depthScale;
      }
      targetWorld.set(
        (progress - 0.5) * 2 * halfWidth,
        needleYFraction * 2 * halfHeight,
        tipWorld.z,
      );
    } else {
      targetWorld.set(0, -worldHeight / 2 - needleLength, 0);
    }

    // Corrige a translação para que a ponta (já rotacionada) caia exatamente
    // sobre a borda revelada da frase, com damping para não tremer no scrub.
    const offsetX = MathUtils.damp(offsetRef.current.x, targetWorld.x - tipWorld.x, 22, delta);
    const offsetY = MathUtils.damp(offsetRef.current.y, targetWorld.y - tipWorld.y, 18, delta);
    offsetRef.current.x = offsetX;
    offsetRef.current.y = offsetY;
    machine.position.x += offsetX;
    machine.position.y += offsetY;

    // O halo acompanha o corpo: dá volume, separa a máquina do fundo escuro e
    // mantém a leitura do conjunto em qualquer tamanho de tela.
    const glow = glowRef.current;
    if (glow) {
      glow.position.set(machine.position.x, machine.position.y + worldHeight * 0.05, GLOW_DEPTH);
      glow.scale.setScalar(worldHeight * GLOW_SIZE_FROM_MACHINE);
    }

    const settled =
      !tattooing &&
      Math.abs(targetScale - currentScale) < POSITION_EPSILON &&
      Math.abs(targetRotation.x - machine.rotation.x) < POSITION_EPSILON &&
      Math.abs(targetRotation.y - machine.rotation.y) < POSITION_EPSILON &&
      Math.abs(targetRotation.z - machine.rotation.z) < POSITION_EPSILON &&
      Math.abs(offsetX) < POSITION_EPSILON &&
      Math.abs(offsetY) < POSITION_EPSILON;

    if (tattooing || !settled) {
      invalidate();
    }
  });

  return (
    <>
      <group
        ref={machineRef}
        position={[0, 0, 0]}
        rotation={[HERO_ROTATION.x, HERO_ROTATION.y, HERO_ROTATION.z]}
      >
        <group ref={bodyRef} scale={fittedModel.heroScale}>
          <primitive object={fittedModel.scene} dispose={null} />
        </group>

        <group ref={tipRef} position={[0, 0, 0]}>
          {/* Agulha composta em código (o GLB tem uma única malha): ponta
              biselada, haste de aço e encaixe que entra no corpo. */}
          <group ref={needleRef} scale={[1, 1, 1]}>
            <mesh castShadow position={[0, NEEDLE_TIP_HEIGHT / 2, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[NEEDLE_TIP_RADIUS, NEEDLE_TIP_HEIGHT, 12]} />
              <meshPhysicalMaterial
                color="#e9e7e3"
                metalness={1}
                roughness={0.08}
                envMapIntensity={2}
                emissive="#FF6600"
                emissiveIntensity={0.16}
              />
            </mesh>
            <mesh castShadow position={[0, NEEDLE_TIP_HEIGHT + NEEDLE_SHAFT_HEIGHT / 2, 0]}>
              <cylinderGeometry
                args={[NEEDLE_SHAFT_RADIUS, NEEDLE_SHAFT_RADIUS, NEEDLE_SHAFT_HEIGHT, 12]}
              />
              <meshPhysicalMaterial
                color="#d8d6d2"
                metalness={1}
                roughness={0.12}
                envMapIntensity={2}
              />
            </mesh>
            <mesh castShadow position={[0, NEEDLE_COLLET_BASE + NEEDLE_COLLET_HEIGHT / 2, 0]}>
              <cylinderGeometry
                args={[NEEDLE_COLLET_RADIUS, NEEDLE_COLLET_RADIUS * 0.72, NEEDLE_COLLET_HEIGHT, 16]}
              />
              <meshPhysicalMaterial
                color="#8f8d8a"
                metalness={0.95}
                roughness={0.3}
                envMapIntensity={1.5}
              />
            </mesh>
          </group>

          {isTattooing && (
            <Sparkles
              count={20}
              scale={Math.max(0.22, referenceHeight * 0.18)}
              size={Math.max(0.5, referenceHeight * 0.5)}
              speed={0.4}
              color="#FF6600"
              opacity={0.8}
            />
          )}
        </group>
      </group>

      {/* Luz de recorte atrás do corpo: o fundo é quase preto, então é este
          halo que separa a máquina do cenário e cria profundidade. */}
      {glowTexture && isImmersiveMode && (
        <mesh ref={glowRef} position={[0, 0, GLOW_DEPTH]} renderOrder={-1}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            opacity={0.45}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}
    </>
  );
}
