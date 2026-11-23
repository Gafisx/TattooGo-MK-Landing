"use client";

import {
  Component,
  Suspense,
  useCallback,
  type ErrorInfo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import {
  DoubleSide,
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
const CAMERA_DISTANCE = 9;
const CAROUSEL_CENTER_Y = -2.3;
const ARTIST_TEXTURE_PATHS = artists.map(
  (_, index) => `/assets/artists/artist-${index + 1}.webp`,
);

gsap.registerPlugin(ScrollTrigger);

function getCarouselLayout(viewportWidth: number) {
  const radius = Math.min(3.2, Math.max(1.6, viewportWidth * 0.32));
  const cardWidth = Math.min(0.66, Math.max(0.5, viewportWidth * 0.06));
  return { radius, cardWidth, cardHeight: cardWidth * 1.385 };
}

useTexture.preload(ARTIST_TEXTURE_PATHS);

class CarouselTextureErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("TattooGo artist carousel textures failed to load", error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SolidColorCarousel() {
  const { viewport } = useThree();
  const { radius, cardWidth, cardHeight } = getCarouselLayout(viewport.width);

  return (
    <group position={[0, CAROUSEL_CENTER_Y, 0]}>
      {artists.map(({ style, color }, index) => {
        const angle = (index / CARD_COUNT) * Math.PI * 2;
        const depth = Math.cos(angle) * radius;
        return (
          <mesh
            key={style}
            position={[
              Math.sin(angle) * radius,
              (-CAROUSEL_CENTER_Y * depth) / CAMERA_DISTANCE,
              Math.cos(angle) * radius,
            ]}
            rotation={[0, angle, 0]}
            scale={[cardWidth, cardHeight, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

function CarouselScene() {
  const groupRef = useRef<Group>(null);
  const cardMeshes = useRef<Mesh[]>([]);
  const sourceTextures = useTexture(ARTIST_TEXTURE_PATHS);
  const textures = useMemo(
    () =>
      sourceTextures.map((sourceTexture) => {
        const texture = sourceTexture.clone();
        texture.colorSpace = SRGBColorSpace;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        return texture;
      }),
    [sourceTextures],
  );
  const materials = useMemo(
    () =>
      textures.map(
        (texture) =>
          new ShaderMaterial({
            side: DoubleSide,
            uniforms: {
              uTexture: { value: texture },
              uTime: { value: 0 },
              uWave: { value: 0.18 },
              uFocus: { value: 1 },
            },
            vertexShader: artistsCarouselVertexShader,
            fragmentShader: artistsCarouselFragmentShader,
            toneMapped: false,
          }),
      ),
    [textures],
  );
  const materialsRef = useRef(materials);
  const { invalidate, viewport } = useThree();

  useEffect(
    () =>
      useScrollStore.subscribe((state, previousState) => {
        if (
          state.artistsCarouselProgress !==
          previousState.artistsCarouselProgress
        ) {
          invalidate();
        }
      }),
    [invalidate],
  );

  useEffect(
    () => () => {
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
    },
    [materials, textures],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const easing = 1 - Math.exp(-delta * 8);
    const progress = useScrollStore.getState().artistsCarouselProgress;
    const rotation = progress * 2 * Math.PI;
    group.rotation.y = rotation;
    group.rotation.x = 0.035 + Math.sin(rotation) * 0.025;

    const { radius, cardWidth, cardHeight } = getCarouselLayout(
      viewport.width,
    );
    for (let index = 0; index < CARD_COUNT; index += 1) {
      const angle = (index / CARD_COUNT) * Math.PI * 2;
      const depth = Math.cos(angle + rotation) * radius;
      const mesh = cardMeshes.current[index];
      const material = materialsRef.current[index];
      const facing = Math.max(0, Math.cos(angle + rotation));
      const cardScale = 0.88 + facing * 0.22;

      mesh.position.set(
        Math.sin(angle) * radius,
        (-CAROUSEL_CENTER_Y * depth) / CAMERA_DISTANCE,
        Math.cos(angle) * radius,
      );
      mesh.rotation.y = angle;
      const targetScaleX = cardWidth * cardScale;
      const targetScaleY = cardHeight * cardScale;
      mesh.scale.x += (targetScaleX - mesh.scale.x) * easing;
      mesh.scale.y += (targetScaleY - mesh.scale.y) * easing;

      material.uniforms.uTime.value = rotation;
      material.uniforms.uWave.value = 0.3;
      const focus = 0.62 + facing * 0.38;
      material.uniforms.uFocus.value +=
        (focus - material.uniforms.uFocus.value) * easing;
      if (
        Math.abs(targetScaleX - mesh.scale.x) > 0.001 ||
        Math.abs(targetScaleY - mesh.scale.y) > 0.001 ||
        Math.abs(focus - material.uniforms.uFocus.value) > 0.001
      ) {
        invalidate();
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, CAROUSEL_CENTER_Y, 0]}
    >
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
  return (
    <CarouselTextureErrorBoundary fallback={<SolidColorCarousel />}>
      <Suspense fallback={<SolidColorCarousel />}>
        <CarouselScene />
      </Suspense>
    </CarouselTextureErrorBoundary>
  );
}

export function ArtistsCarouselSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startProgress: number;
    width: number;
  } | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startProgress: useScrollStore.getState().artistsCarouselProgress,
        width: Math.max(1, bounds.width),
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const progress =
        drag.startProgress - (event.clientX - drag.startX) / drag.width;
      useScrollStore
        .getState()
        .setArtistsCarouselProgress(Math.min(1, Math.max(0, progress)));
    },
    [],
  );

  const handlePointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (dragRef.current?.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [],
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

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      const progress = { value: 0 };
      const tween = gsap.to(progress, {
        value: 1,
        ease: "none",
        onUpdate: () => {
          useScrollStore
            .getState()
            .setArtistsCarouselProgress(
              Math.min(1, Math.max(0, progress.value)),
            );
        },
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      tween.scrollTrigger?.refresh();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className="relative isolate flex min-h-[100svh] touch-pan-y items-center overflow-hidden bg-[linear-gradient(180deg,rgba(18,18,18,0.72),rgba(18,18,18,0.2)_48%,rgba(18,18,18,0.76))] py-20"
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
