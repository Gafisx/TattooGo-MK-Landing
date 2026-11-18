# TattooGo MK

## Experiência 3D

A cena usa `ScrollTrigger` para publicar o progresso da página no Zustand. O
decalque e a máquina de tatuagem leem o mesmo progresso no `useFrame` do React
Three Fiber; o Canvas usa `frameloop="demand"` e respeita `prefers-reduced-motion`.

Para a cena final, disponibilize estes assets:

- `public/assets/models/arm_with_skin.glb` — antebraço com textura de pele.
- `public/assets/models/tattoo-machine.glb` — máquina de tatuagem.
- `public/assets/decals/star_tattoo.png` — arte PNG com transparência.

Se o modelo do braço ou o decalque não estiver disponível, a cena exibe um
antebraço procedural e a textura de tinta já incluída em `public/assets/images/`.
