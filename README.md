# TattooGo MK

## Experiência 3D

A cena usa `ScrollTrigger` para publicar o progresso da página no Zustand. O
decalque e a máquina de tatuagem leem o mesmo progresso no `useFrame` do React
Three Fiber; o Canvas usa `frameloop="demand"` e respeita `prefers-reduced-motion`.
Durante o movimento e por um breve intervalo após cada avanço, a agulha vibra em
torno do ponto de contato calculado; com movimento reduzido, ela fica estática.
O material da pele usa acabamento fosco para evitar reflexos artificiais. Os
CTAs da landing levam às jornadas para clientes e tatuadores, sem simular links
de download que ainda não existem.

O carrossel de estilos reutiliza o Canvas principal, mostrando sete cartões com
texturas procedurais enquanto a seção está visível. O progresso global do scroll
completa uma volta no círculo; o shader aplica ondulação sutil e reforça o
cartão em foco. Com `prefers-reduced-motion`, a cena 3D é substituída por uma
grade HTML estática.

Para a cena final, disponibilize estes assets:

- `public/assets/models/arm_with_skin.glb` — antebraço com textura de pele.
- `public/assets/models/tattoo-machine.glb` — máquina de tatuagem.
- `public/assets/decals/star-tattoo.svg` — arte vetorial original com transparência.

Se o modelo do braço ou o decalque não estiver disponível, a cena exibe um
antebraço procedural e a textura de tinta já incluída em `public/assets/images/`.
