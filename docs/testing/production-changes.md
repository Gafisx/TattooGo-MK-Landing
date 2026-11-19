# Alterações de código de produção para testabilidade

## `components/Deferred3DCanvas.tsx`

A cena permanece carregada por `next/dynamic` com `ssr: false`, dividindo o bundle e evitando WebGL no servidor. Removido o gate com `IntersectionObserver`: como o canvas é um fundo fixo de viewport, sua visibilidade não representa um gatilho de entrada em tela e o gate impedia a cena de montar no navegador.

## `components/ProceduralAudioProvider.tsx`

O provider impede criação do grafo de Web Audio com `prefers-reduced-motion: reduce` e silencia um grafo existente quando a preferência muda. Essa mudança preserva o comportamento normal e remove áudio em modo reduzido.

## `components/InteractiveTattooArm.tsx`

A função exportada `getInkRevealProgress(reducedMotion)` separa o cálculo do uniform do shader em uma fronteira testável. Ela não altera o valor produzido em modo normal nem reduzido.

## `components/SecurityAndFooter.tsx`

O texto de copyright foi elevado de opacidade para melhorar contraste. O link do footer deixou de declarar `aria-label` redundante, permitindo que o nome acessível seja formado pelo texto visível e preserve a correspondência exigida por WCAG 2.5.3. O escudo apontava para um PNG inexistente; foi substituído por um ícone ShieldCheck, mantendo o texto alternativo e o tratamento visual.

## `components/HeroSection.tsx` e `components/ImmersiveExperience.tsx`

Removidas referências decorativas a `/assets/images/hero-texture-background.png`, que não existe em `public/assets/images` e gerava erros 404 no carregamento da home. Os gradientes CSS existentes mantêm o fundo e a direção visual sem depender do recurso ausente.

## `components/DualSidedSection.tsx`

Após o pull dos commits que removeram `cliente.png` e `tatuador.png`, os mockups passaram a usar as variantes `.webp` existentes, eliminando referências quebradas sem alterar o conteúdo visual. O `sizes` também descreve a coluna única no mobile e meia tela no desktop.

## `components/ReducedMotionFallback.tsx`

O fallback referenciava `/assets/images/tattoo-needle-scroll-hero.png`, também ausente. O fundo estático agora usa gradientes CSS e mantém a paleta escura sem uma requisição quebrada.

## `components/InteractiveTattooArm.tsx`

Extraídas as operações de configuração do shader e atualização do uniform em funções tipadas para validar a evolução do progresso sem compilar GLSL em happy-dom. `InkRevealMaterial` continua chamando essas mesmas funções durante a compilação e em `useFrame`.
