# Suíte de testes do TattooGo MK

## Stack

- **Vitest**: runner compatível com ESM e TypeScript, usado para unidade, integração e acessibilidade.
- **happy-dom**: DOM rápido para testes de componentes; é suficiente quando não se valida layout de navegador real.
- **React Testing Library** e **user-event**: consultas por roles, nomes e texto acessível.
- **@react-three/test-renderer**: valida a cena R3F do carrossel, incluindo as sete texturas, meshes, espaçamento e rotação.
- **Playwright**: jornadas reais de navegador, montagem do Canvas/fallback, scroll e `emulateMedia`.
- **vitest-axe** e **@axe-core/playwright**: regressão automática de acessibilidade.
- **MSW**: não foi ativado porque a aplicação não realiza fetches de rede no fluxo testado.
- **Cobertura V8**: métricas de linhas, funções, branches e statements.

## Comandos

```bash
npm ci
npm run test -- --run
npm run test:watch
npm run test:coverage
npx playwright install --with-deps chromium
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build
```

## Organização

- Testes unitários co-localizados em `components/*.test.tsx`.
- Integrações em `tests/integration/*.test.tsx`.
- Acessibilidade Vitest em `tests/a11y/*.test.tsx`.
- Jornada Playwright em `e2e/*.spec.ts`.
- Mocks reutilizáveis em `tests/setup/mocks/`.
- Helpers de renderização e áudio em `tests/utils/`.

## Inventário validado

- Vitest: 12 arquivos e 28 casos de unidade, integração e acessibilidade.
- Playwright: 4 specs com 5 jornadas no Chromium, incluindo acessibilidade, carregamento, movimento reduzido e scroll até as jornadas de cliente e tatuador.
- O teste R3F do carrossel valida as sete texturas WebP, sete meshes, distribuição angular e rotação sincronizada ao progresso.

## Estratégia de mocks

### Web Audio

`tests/setup/mocks/audio.ts` implementa `AudioContext`, os nós usados pelo provider e parâmetros com `setValueAtTime`, `setTargetAtTime` e rampas. Os testes usam `installFakeAudioContext()` e `vi.clearAllMocks()`; nunca dependem de áudio real.

### GSAP e Lenis

`gsap.context`, timelines e ScrollTrigger são mocks determinísticos. Lenis usa uma classe fake que registra instâncias e permite verificar `destroy()` no unmount.

### Three.js e R3F

`<Canvas>`, `useFrame` e `useThree` possuem mocks para integração DOM. O `@react-three/test-renderer` verifica os sete meshes e materiais do carrossel sem exigir WebGL; a avaliação de pixels/GPU não ocorre em happy-dom. Uniformes do shader da tatuagem são testados por valores controlados; GLSL não é compilado pela suíte.

### Browser APIs

`matchMedia`, `IntersectionObserver`, `ResizeObserver` e `requestAnimationFrame` são controlados pelos mocks reutilizáveis. Nenhum teste usa temporizadores reais.

## Redução de movimento

A preferência `prefers-reduced-motion: reduce` é simulada com `setPrefersReducedMotion(true)`. O provider de áudio impede criação do grafo nesse modo e silencia um grafo já criado quando a preferência muda.

## Convenções

- Nomes de testes em português.
- Consultas por `role`, `aria-label`, `getByText` ou `getByRole`, evitando HTML bruto.
- Nenhum `setTimeout` real.
- Nenhum snapshot sem contrato estável.
- Cada teste limpa e desmonta recursos no setup global.

## Limitações

- Compilação de shaders GLSL não é executada em jsdom/happy-dom.
- Uniformes são validados por integração com mocks determinísticos.
- Playwright cobre WebGL onde disponível no navegador; renderização real não substitui benchmarks de GPU.
- Axe automatizado não garante contraste visual em todas as imagens e gradientes; a revisão manual permanece necessária.

## Manifesto e checksums

O [manifesto JSON](./test-manifest.json) registra os comandos, a cobertura observada e os SHA-256 dos testes, mocks, configurações e recursos amostrados. Os hashes são uma fotografia desta revisão e devem ser regenerados após alterações nesses arquivos.
