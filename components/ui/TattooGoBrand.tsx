/**
 * Escalas oficiais da assinatura. Todas derivam do MESMO desenho da logo da
 * Home (`HeroSection`): `TattooGo` em Caveat Bold verde neon com o traço curvo
 * de brilho, seguido de `MK` em sans black laranja `#FF6600`. O tamanho troca
 * apenas o `font-size` raiz — o sublinhado, os brilhos e o espaçamento são
 * proporcionais em `em`, então a marca nunca distorce nem inverte as cores.
 *
 * - `xs`: barra superior fixa (56px de altura).
 * - `sm`: rodapé de subpáginas.
 * - `md`: rodapé da landing.
 * - `lg`: destaques/seções que pedem a marca em primeiro plano.
 */
export type TattooGoBrandSize = "xs" | "sm" | "md" | "lg";

export type TattooGoBrandProps = {
  /** Escala proporcional do padrão da Home. */
  size?: TattooGoBrandSize;
  /** Classes de layout do slot (a marca em si não recebe estilo externo). */
  className?: string;
  /** Nome acessível. Quando o slot já tem rótulo próprio, use `ariaHidden`. */
  label?: string;
  /**
   * Marca puramente decorativa dentro de um link/botão que já expõe o nome
   * acessível ("TattooGo MK — ir para a página inicial", por exemplo).
   */
  decorative?: boolean;
};

/**
 * Assinatura visual única da marca TattooGo MK.
 *
 * Server Component por padrão (sem hooks): pode ser usado em layouts, páginas
 * de servidor e dentro de componentes de cliente sem duplicar markup.
 */
export default function TattooGoBrand({
  size = "md",
  className = "",
  label = "TattooGo MK",
  decorative = false,
}: TattooGoBrandProps) {
  return (
    <span
      className={`tattoo-brand ${className}`.trim()}
      data-size={size}
      {...(decorative
        ? { "aria-hidden": "true" as const }
        : { role: "img", "aria-label": label })}
    >
      <span aria-hidden="true" className="tattoo-brand__word">
        TattooGo
        <svg
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          focusable="false"
          aria-hidden="true"
          className="tattoo-brand__stroke"
        >
          <path
            d="M 2 8 Q 50 2 98 8"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span aria-hidden="true" className="tattoo-brand__mk">
        MK
      </span>
    </span>
  );
}
