"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  type Group,
} from "three";

import {
  artistsCarouselFragmentShader,
  artistsCarouselVertexShader,
} from "@/components/artistsCarouselShader";
import { useScrollStore } from "@/components/scrollProgressStore";

const artists = [
  { style: "Traditional", descriptor: "Bold lines · Classic", color: "#FF6600" },
  { style: "Fine line", descriptor: "Delicate · Precise", color: "#00FF66" },
  { style: "Blackwork", descriptor: "Contrast · Texture", color: "#FF9900" },
  { style: "Japanese", descriptor: "Flow · Heritage", color: "#FF6600" },
  { style: "Geometric", descriptor: "Form · Symmetry", color: "#00FF66" },
  { style: "Botanical", descriptor: "Nature · Detail", color: "#FF9900" },
  { style: "Neo traditional", descriptor: "Color · Expression", color: "#FF6600" },
];

const CARD_COUNT = artists.length;
const TAU = Math.PI * 2;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function createPlaceholderTexture(
  style: string,
  descriptor: string,
  accent: string,
  index: number,
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 840;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the artists carousel placeholder texture");
  }

  context.fillStyle = "#121212";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const wash = context.createLinearGradient(0, 0, 640, 840);
  wash.addColorStop(0, `${accent}55`);
  wash.addColorStop(0.48, "#121212");
  wash.addColorStop(1, `${accent}22`);
  context.fillStyle = wash;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.translate(320, 350);
  context.strokeStyle = `${accent}CC`;
  context.lineWidth = 3;
  context.globalAlpha = 0.85;

  for (let ring = 0; ring < 6; ring += 1) {
    context.beginPath();
    context.arc(0, 0, 62 + ring * 37, ring * 0.28, Math.PI * 1.75 + ring * 0.28);
    context.stroke();
  }

  context.rotate((index % 4) * 0.22);
  context.beginPath();
  context.moveTo(-145, 130);
  context.lineTo(0, -170);
  context.lineTo(145, 130);
  context.closePath();
  context.stroke();
  context.restore();

  context.fillStyle = accent;
  context.fillRect(44, 54, 54, 5);
  context.fillStyle = "rgba(255,255,255,0.68)";
  context.font = "600 17px Arial, sans-serif";
  context.letterSpacing = "4px";
  context.fillText("TATTOOGO / ARTIST", 44, 93);

  context.fillStyle = "#FFFFFF";
  context.font = "600 48px Arial, sans-serif";
  context.letterSpacing = "-1px";
  context.fillText(style.toUpperCase(), 44, 700, 552);

  context.fillStyle = "rgba(255,255,255,0.58)";
  context.font = "400 20px Arial, sans-serif";
  context.letterSpacing = "1px";
  context.fillText(descriptor.toUpperCase(), 44, 746, 552);

  context.fillStyle = accent;
  context.font = "500 18px Arial, sans-serif";
  context.fillText(`PORTFOLIO  /  0${index + 1}`, 44, 794);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function CarouselScene() {
  const groupRef = useRef<Group>(null);
  const cardMeshes = useRef<Mesh[]>([]);
  const materials = useMemo(
    () =>
      artists.map(({ style, descriptor, color }, index) => {
        const texture = createPlaceholderTexture(
          style,
          descriptor,
          color,
          index,
        );
        return new ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uTime: { value: 0 },
            uWave: { value: 0.18 },
            uFocus: { value: 1 },
          },
          vertexShader: artistsCarouselVertexShader,
          fragmentShader: artistsCarouselFragmentShader,
          toneMapped: false,
        });
      }),
    [],
  );
  const materialsRef = useRef(materials);
  const { viewport } = useThree();

  useEffect(
    () => () => {
      materials.forEach((material) => {
        material.uniforms.uTexture.value.dispose();
        material.dispose();
      });
    },
    [materials],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const easing = 1 - Math.exp(-delta * 8);
    const progress = useScrollStore.getState().progress;
    const rotation = progress * TAU;
    group.rotation.y = rotation;
    group.rotation.x = 0.035 + Math.sin(rotation) * 0.025;

    const radius = Math.min(2.85, viewport.width * 0.3);
    const cardWidth = Math.min(1.48, Math.max(0.86, viewport.width * 0.19));
    const cardHeight = cardWidth * 1.385;

    for (let index = 0; index < CARD_COUNT; index += 1) {
      const angle = (index / CARD_COUNT) * TAU;
      const mesh = cardMeshes.current[index];
      const material = materialsRef.current[index];
      const facing = Math.max(0, Math.cos(angle + rotation));
      const cardScale = 0.9 + facing * 0.15;

      mesh.position.set(
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius,
      );
      mesh.rotation.y = angle;
      mesh.scale.x += (cardWidth * cardScale - mesh.scale.x) * easing;
      mesh.scale.y += (cardHeight * cardScale - mesh.scale.y) * easing;

      material.uniforms.uTime.value = rotation;
      material.uniforms.uWave.value = 0.3;
      const focus = 0.62 + facing * 0.38;
      material.uniforms.uFocus.value +=
        (focus - material.uniforms.uFocus.value) * easing;
    }
  });

  return (
    <group ref={groupRef}>
      {artists.map(({ style }, index) => (
        <mesh
          key={style}
          ref={(mesh) => {
            if (mesh) cardMeshes.current[index] = mesh;
          }}
          material={materials[index]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export default function ArtistsCarousel3D({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const visible = useScrollStore((state) => state.artistsCarouselVisible);

  if (reducedMotion || !visible) return null;
  return <CarouselScene />;
}

export function ArtistsCarouselSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        useScrollStore.getState().setArtistsCarouselVisible(
          entry.isIntersecting,
        );
      },
      { threshold: 0.1 },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      useScrollStore.getState().setArtistsCarouselVisible(false);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[linear-gradient(180deg,rgba(18,18,18,0.72),rgba(18,18,18,0.2)_48%,rgba(18,18,18,0.76))] py-20"
      aria-labelledby="artists-carousel-title"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#FF9900] sm:text-sm">
            Encontre sua assinatura
          </p>
          <h2
            id="artists-carousel-title"
            className="text-[clamp(2.5rem,5.6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.065em] text-white"
          >
            Estilos que contam
            <span className="block text-white/45">histórias únicas.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
            Explore diferentes linguagens da tatuagem e encontre a arte que
            traduz quem você é.
          </p>
        </header>

        {reducedMotion ? (
          <ul
            className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Estilos de tatuagem"
          >
            {artists.map(({ style, descriptor, color }) => (
              <li
                key={style}
                className="rounded-2xl border border-white/10 bg-[#121212]/85 p-4"
              >
                <span
                  aria-hidden="true"
                  className="mb-4 block h-1 w-10 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <h3 className="text-sm font-semibold text-white">{style}</h3>
                <p className="mt-1 text-xs text-white/55">{descriptor}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-white/40">
            Role para explorar
          </p>
        )}

        {!reducedMotion && (
          <ul className="sr-only" aria-label="Estilos de tatuagem">
            {artists.map(({ style, descriptor }) => (
              <li key={style}>
                {style}: {descriptor}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
