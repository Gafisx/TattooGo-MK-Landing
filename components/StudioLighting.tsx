"use client";

import { useEffect, useMemo, useRef } from "react";
import { Environment } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Object3D, type SpotLight } from "three";

export default function StudioLighting() {
  const { invalidate, scene } = useThree();
  const orangeLightRef = useRef<SpotLight>(null);
  const orangeTarget = useMemo(() => new Object3D(), []);

  useEffect(() => {
    orangeTarget.position.set(1.5, -1.8, -0.55);
    scene.add(orangeTarget);
    if (orangeLightRef.current) {
      orangeLightRef.current.target = orangeTarget;
    }
    invalidate();

    return () => {
      scene.remove(orangeTarget);
    };
  }, [invalidate, orangeTarget, scene]);

  return (
    <>
      <Environment
        files="/assets/hdri/studio.hdr"
        environmentIntensity={1}
        resolution={256}
      />
      <directionalLight
        castShadow
        position={[-4, 6, 6]}
        intensity={2}
        color="#F4F1ED"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00012}
      />
      <spotLight
        ref={orangeLightRef}
        position={[4, 2, 5]}
        angle={0.6}
        penumbra={0.8}
        intensity={15}
        color="#FF6600"
        distance={18}
      />
      <spotLight
        position={[-5, -2, 4]}
        angle={0.58}
        penumbra={0.8}
        intensity={18}
        color="#121212"
        distance={16}
      />
      <spotLight
        position={[2, -4, 3]}
        angle={0.64}
        penumbra={0.82}
        intensity={20}
        color="#00FF66"
        distance={14}
      />
    </>
  );
}
