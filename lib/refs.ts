import type { RefObject } from "react";

/**
 * O `View` do @react-three/drei declara `track?: RefObject<HTMLElement>`,
 * enquanto o React 19 tipa `useRef<HTMLDivElement>(null)` como
 * `RefObject<HTMLDivElement | null>`.
 *
 * Em runtime é exatamente o mesmo objeto — só a nulabilidade e a
 * especialização do elemento divergem. O alias documenta a conversão no limite
 * com a biblioteca sem espalhar `as ...` sem contexto pelos componentes.
 *
 * Uso: `const trackRef = viewRef as TrackRef;`
 */
export type TrackRef = RefObject<HTMLElement>;
