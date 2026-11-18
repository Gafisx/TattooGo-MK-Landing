"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

export default function StudioLighting() {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[0, 5, -5]}
          scale={[8, 8, 1]}
          color="#F4F1ED"
        />
        <Lightformer
          form="ring"
          intensity={0.8}
          position={[-5, 1, 2]}
          scale={3}
          color="#00FF66"
        />
      </Environment>
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
        position={[4, 5, 5]}
        angle={0.52}
        penumbra={0.75}
        intensity={28}
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
      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.34}
        scale={8}
        blur={2.4}
        far={4}
        frames={1}
        color="#121212"
      />
    </>
  );
}
