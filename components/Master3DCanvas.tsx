"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  ACESFilmicToneMapping,
  type Group,
  type Object3D,
} from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ProceduralTattooMachine() {
  return (
    <group rotation={[0.08, 0, -0.34]}>
      <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.31, 0.4, 2.15, 40, 1, false]} />
        <meshStandardMaterial
          color="#303338"
          metalness={0.94}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[-1.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.62, 32]} />
        <meshStandardMaterial
          color="#17191c"
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[-1.56, 0, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 24]} />
        <meshStandardMaterial
          color="#72777d"
          metalness={0.96}
          roughness={0.18}
        />
      </mesh>

      {[-0.82, -0.42, 0.36, 0.72].map((x, index) => (
        <mesh
          key={x}
          position={[x, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <torusGeometry args={[index > 1 ? 0.38 : 0.345, 0.035, 12, 40]} />
          <meshStandardMaterial
            color={index === 2 ? "#FF6600" : "#969ba0"}
            emissive={index === 2 ? "#FF6600" : "#121212"}
            emissiveIntensity={index === 2 ? 0.48 : 0}
            metalness={0.96}
            roughness={0.18}
          />
        </mesh>
      ))}

      <mesh position={[1.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.23, 0.31, 0.48, 32]} />
        <meshStandardMaterial
          color="#24272b"
          metalness={0.92}
          roughness={0.23}
        />
      </mesh>

      <mesh position={[1.73, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.14, 0.72, 20]} />
        <meshStandardMaterial
          color="#c6c9ca"
          metalness={0.98}
          roughness={0.14}
          emissive="#00FF66"
          emissiveIntensity={0.08}
        />
      </mesh>

      <mesh position={[0, 0.43, 0]} castShadow>
        <boxGeometry args={[0.82, 0.16, 0.48]} />
        <meshStandardMaterial
          color="#1b1d20"
          metalness={0.9}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0.37, 0.55, 0]} castShadow>
        <boxGeometry args={[0.24, 0.09, 0.3]} />
        <meshStandardMaterial
          color="#00FF66"
          emissive="#00FF66"
          emissiveIntensity={0.55}
          metalness={0.4}
          roughness={0.26}
        />
      </mesh>
    </group>
  );
}

function TattooMachine() {
  const [model, setModel] = useState<Object3D | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loader = new GLTFLoader();
    let active = true;

    fetch("/assets/models/tattoomachine.glb", {
      method: "HEAD",
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 404) return null;
        if (!response.ok) {
          throw new Error(
            `Tattoo machine model check failed (${response.status})`,
          );
        }
        return new Promise<Object3D>((resolve, reject) => {
          loader.load(
            "/assets/models/tattoomachine.glb",
            (gltf) => resolve(gltf.scene),
            undefined,
            reject,
          );
        });
      })
      .then((scene) => {
        if (active && scene) setModel(scene);
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        console.error("Could not load /assets/models/tattoomachine.glb", error);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return model ? (
    <primitive object={model} scale={1.15} />
  ) : (
    <ProceduralTattooMachine />
  );
}

function ScrollDrivenMachine() {
  const machineRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const { viewport } = useThree();

  useEffect(() => {
    const updateProgress = (trigger?: ScrollTrigger) => {
      progressRef.current =
        trigger?.progress ??
        Math.min(
          1,
          Math.max(
            0,
            window.scrollY /
              Math.max(1, ScrollTrigger.maxScroll(window)),
          ),
        );
    };

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
      onUpdate: updateProgress,
      onRefresh: updateProgress,
      invalidateOnRefresh: true,
    });
    const handleScroll = () => updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress(trigger);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      trigger.kill();
    };
  }, []);

  useFrame((state, delta) => {
    const machine = machineRef.current;
    if (!machine) return;

    const progress = progressRef.current;
    const horizontalAmplitude = Math.min(viewport.width * 0.2, 2.6);
    const verticalAmplitude = Math.min(viewport.height * 0.24, 2.3);
    const targetX =
      Math.sin(progress * Math.PI * 4 + Math.PI / 2) * horizontalAmplitude;
    const targetY =
      Math.cos(progress * Math.PI * 2) * verticalAmplitude * 0.38;

    machine.position.x +=
      (targetX - machine.position.x) * (1 - Math.exp(-4 * delta));
    machine.position.y +=
      (targetY - machine.position.y) * (1 - Math.exp(-4 * delta));
    machine.rotation.y +=
      ((progress * Math.PI * 1.4 - machine.rotation.y) *
        (1 - Math.exp(-3 * delta)));
    machine.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.06;
  });

  const machineScale = Math.min(1.05, Math.max(0.52, viewport.width * 0.075));

  return (
    <Float
      speed={0.7}
      rotationIntensity={0.035}
      floatIntensity={0.08}
      floatingRange={[-0.08, 0.08]}
    >
      <group ref={machineRef} scale={machineScale} position={[0, 0, 0]}>
        <TattooMachine />
      </group>
    </Float>
  );
}

function StudioScene() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight
        position={[-4, 6, 6]}
        intensity={2.2}
        color="#f4f1ed"
      />
      <directionalLight
        position={[3, 2, -4]}
        intensity={1.1}
        color="#00FF66"
      />
      <spotLight
        position={[4, 5, 5]}
        angle={0.52}
        penumbra={0.75}
        intensity={34}
        color="#FF6600"
        distance={18}
      />
      <spotLight
        position={[-5, -2, 4]}
        angle={0.6}
        penumbra={0.8}
        intensity={22}
        color="#FF9900"
        distance={16}
      />
      <ScrollDrivenMachine />
    </>
  );
}

export default function Master3DCanvas() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 40, near: 0.1, far: 40 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#121212", 0);
          gl.toneMapping = ACESFilmicToneMapping;
        }}
        fallback={null}
      >
        <Suspense fallback={null}>
          <StudioScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
