import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { DoubleSide, Group, Mesh, ShaderMaterial, Texture } from "three";

import ArtistsCarousel3D, {
  ArtistsCarouselSection,
} from "@/components/ArtistsCarousel3D";
import { setPrefersReducedMotion } from "@/tests/setup/mocks/matchMedia";
import { ControlledIntersectionObserver } from "@/tests/setup/mocks/observers";
import { useScrollStore } from "@/components/scrollProgressStore";

const carouselMock = vi.hoisted(() => ({
  textures: [] as Texture[],
  useTexture: vi.fn(() => carouselMock.textures),
  preload: vi.fn(),
}));

vi.mock("@react-three/drei", () => ({
  useTexture: Object.assign(carouselMock.useTexture, {
    preload: carouselMock.preload,
  }),
}));

const artistTexturePaths = Array.from(
  { length: 7 },
  (_, index) => `/assets/artists/artist-${index + 1}.webp`,
);

describe("ArtistsCarouselSection", () => {
  afterEach(cleanup);

  it("exibe uma lista estática de estilos em movimento reduzido", () => {
    setPrefersReducedMotion(true);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    render(<ArtistsCarouselSection />);
    expect(screen.getByRole("list", { name: "Estilos de tatuagem" }))
      .toBeInTheDocument();
    expect(screen.getByText("Traditional")).toBeVisible();
  });

  it("observa a seção e desconecta no unmount", () => {
    setPrefersReducedMotion(false);
    ControlledIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    const { unmount } = render(<ArtistsCarouselSection />);
    const observer = ControlledIntersectionObserver.instances[0];
    expect(observer.observe).toHaveBeenCalled();
    unmount();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it("permite controlar o progresso do carrossel ao arrastar", () => {
    setPrefersReducedMotion(false);
    useScrollStore.getState().setArtistsCarouselProgress(0);
    vi.stubGlobal("IntersectionObserver", ControlledIntersectionObserver);
    render(<ArtistsCarouselSection />);
    const section = document.querySelector("section");
    expect(section).not.toBeNull();
    if (!section) return;

    Object.defineProperty(section, "getBoundingClientRect", {
      value: () => ({ width: 200 }),
    });
    Object.defineProperty(section, "setPointerCapture", {
      value: vi.fn(),
    });
    Object.defineProperty(section, "hasPointerCapture", {
      value: () => false,
    });

    fireEvent.pointerDown(section, {
      button: 0,
      pointerId: 7,
      clientX: 100,
    });
    fireEvent.pointerMove(section, { pointerId: 7, clientX: 40 });

    expect(useScrollStore.getState().artistsCarouselProgress).toBeCloseTo(0.3);

    fireEvent.pointerUp(section, { pointerId: 7 });
  });
});

describe("ArtistsCarousel3D scene", () => {
  afterEach(() => {
    useScrollStore.getState().setArtistsCarouselVisible(false);
    useScrollStore.getState().setArtistsCarouselProgress(0);
    carouselMock.useTexture.mockClear();
    carouselMock.textures = [];
  });

  it("mapeia as sete texturas WebP em meshes equidistantes que acompanham o scroll", async () => {
    carouselMock.textures = artistTexturePaths.map(() => new Texture());
    useScrollStore.getState().setArtistsCarouselVisible(true);

    const renderer = await ReactThreeTestRenderer.create(
      <ArtistsCarousel3D reducedMotion={false} />,
    );

    try {
      expect(carouselMock.useTexture).toHaveBeenCalledWith(artistTexturePaths);
      const meshes = renderer.scene
        .findAll((node) => node.instance instanceof Mesh)
        .map(({ instance }) => instance)
        .filter((instance): instance is Mesh => instance instanceof Mesh);
      expect(meshes).toHaveLength(7);

      const materials = meshes
        .map((mesh) => mesh.material)
        .filter((material): material is ShaderMaterial => material instanceof ShaderMaterial);
      expect(materials).toHaveLength(7);
      expect(materials.every((material) => material.side === DoubleSide)).toBe(
        true,
      );
      const mappedTextures = materials.map(
        (material) => material.uniforms.uTexture.value,
      );
      expect(new Set(mappedTextures).size).toBe(7);

      useScrollStore.getState().setArtistsCarouselProgress(0.25);
      await renderer.advanceFrames(1, 1 / 60);

      const carouselGroup = renderer.scene
        .findAll((node) => node.instance instanceof Group)
        .at(-1)?.instance;
      expect(carouselGroup).toBeInstanceOf(Group);
      expect(carouselGroup?.rotation.y).toBeCloseTo(Math.PI / 2);

      const radii = meshes.map((mesh) =>
        Math.hypot(mesh.position.x, mesh.position.z),
      );
      expect(radii.every((radius) => radius > 0)).toBe(true);
      expect(radii.every((radius) => Math.abs(radius - radii[0]) < 0.0001))
        .toBe(true);

      const angles = meshes
        .map((mesh) => {
          const angle = Math.atan2(mesh.position.x, mesh.position.z);
          return (angle + 2 * Math.PI) % (2 * Math.PI);
        })
        .sort((left, right) => left - right);
      const angleSteps = angles.map((angle, index) => {
        const nextAngle = angles[(index + 1) % angles.length];
        return (nextAngle - angle + 2 * Math.PI) % (2 * Math.PI);
      });
      expect(
        angleSteps.every(
          (step) => Math.abs(step - (2 * Math.PI) / 7) < 0.0001,
        ),
      ).toBe(true);
    } finally {
      await renderer.unmount();
    }
  });
});
