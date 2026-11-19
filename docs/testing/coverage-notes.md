# Notas de cobertura

Os thresholds globais são:

- lines: 80
- functions: 80
- branches: 75
- statements: 80

`app/layout.tsx` é excluído por ser shell estrutural. Tipos (`*.d.ts`), `next-env.d.ts` e arquivos GLSL são excluídos. Casos no limite de 80% devem ser tratados como bloqueantes no CI.

Arquivos sem teste de valor funcional independente podem ficar abaixo do threshold justificadamente:

- `components/ArtistsCarousel3D.tsx`: `@react-three/test-renderer` verifica sete texturas, meshes, espaçamento angular e rotação sincronizada ao progresso; não valida pixels nem compilação GPU.
- `components/StudioLighting.tsx` e `TattooMachineModel.tsx`: dependem de WebGL/GPU e são validados por fronteiras de integração, sem snapshots de renderização.
- Arquivos de shader em TypeScript: apenas contratos de uniformes são cobertos; código GLSL real não é compilado em happy-dom.
- `ProceduralAudioProvider`, `InteractiveTattooArm`, `SmoothScroll`, `DualSidedSection` e `SplitJourneySection`: dependem de APIs externas e timelines; as fronteiras críticas são testadas, enquanto ramos internos de GSAP/Web Audio ficam fora da agregação V8 para evitar métricas artificiais.

Quando o CI apontar arquivo abaixo do threshold, revisar primeiro caminhos de erro e cleanup antes de adicionar asserts frágeis.

## Execução local

Na execução de 2026-11-19, Vitest mediu 93,33% de statements, 90% de branches, 86,66% de funções e 95% de linhas nos módulos incluídos (28 testes em 12 arquivos). O denominador foi de 45 statements; isso não representa todos os componentes de produção. Módulos dependentes de R3F, Web Audio e timelines estão excluídos conscientemente e cobertos por testes de fronteira, incluindo `@react-three/test-renderer` para a cena do carrossel.

Playwright encontrou referências de imagem inexistentes para `hero-texture-background.png`, `security-split-payments-shield.png` e `tattoo-needle-scroll-hero.png`. As referências foram removidas e substituídas por gradientes CSS ou pelo ícone ShieldCheck. Os PNGs `cliente.png` e `tatuador.png` foram removidos do remoto e os componentes agora usam as variantes WebP existentes. Axe não identificou violações nos cenários executados.
