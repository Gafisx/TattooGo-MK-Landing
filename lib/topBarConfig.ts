/**
 * Contrato tipado da barra superior contextual estilo Apple do TattooGo MK.
 *
 * Este módulo é a única fonte de verdade sobre "o que aparece" em cada layout.
 * Nenhum componente decide rótulos, ícones ou destinos por conta própria: o
 * `AppleTopBar` apenas renderiza a configuração resolvida aqui. Assim, o Passo 2
 * (ações diretas por layout) consegue plugar novos handlers sem tocar na UI.
 */

export type TopBarContextKey =
  | "landing"
  | "download"
  | "clientes"
  | "tatuadores"
  | "support";

/**
 * Chaves de ícone (nunca componentes) para manter este módulo puro, testável em
 * Node e livre de dependência de React. O mapa para `lucide-react` vive em
 * `components/ui/topBarIcons.ts`.
 */
export type TopBarIconKey =
  | "users"
  | "palette"
  | "download"
  | "help"
  | "feedback"
  | "shield"
  | "terms"
  | "mobile"
  | "layers"
  | "crown"
  | "compass"
  | "sparkles"
  | "map"
  | "budget"
  | "dashboard"
  | "calendar"
  | "portfolio"
  | "login"
  | "lock";

/**
 * Discriminante explícito do tipo de interação. `route` navega entre layouts,
 * `anchor` rola dentro do layout atual (com cancelamento imediato ao toque) e
 * `action` dispara um gatilho direto (modal/gaveta/foco) consumido pelo Passo 2.
 */
export type TopBarItemKind = "route" | "anchor" | "action";

export type TopBarTransition = "nav-forward" | "nav-back";

type TopBarItemBase = {
  readonly id: string;
  readonly label: string;
  readonly icon: TopBarIconKey;
};

export type TopBarRouteItem = TopBarItemBase & {
  readonly kind: "route";
  readonly href: string;
  readonly transition: TopBarTransition;
};

export type TopBarAnchorItem = TopBarItemBase & {
  readonly kind: "anchor";
  /** `id` de uma seção já existente no layout atual. */
  readonly sectionId: string;
};

export type TopBarActionItem = TopBarItemBase & {
  readonly kind: "action";
  readonly actionId: string;
  /**
   * Destino determinístico quando nenhum handler do Passo 2 reivindicar a ação
   * (ou quando o alvo de foco não existir no layout atual). Nunca deixa o botão
   * "morto".
   */
  readonly fallbackHref?: string;
};

export type TopBarItem = TopBarRouteItem | TopBarAnchorItem | TopBarActionItem;

export type TopBarAccent = "orange" | "green";

export type TopBarConfig = {
  readonly context: TopBarContextKey;
  readonly ariaLabel: string;
  readonly accent: TopBarAccent;
  readonly items: readonly TopBarItem[];
};

/** Cores contextuais oficiais do TattooGo MK. */
export const TOP_BAR_ACCENTS: Record<TopBarAccent, string> = {
  orange: "#FF6600",
  green: "#00FF66",
};

/** Prefácios de rota que compartilham o contexto de suporte/legal/feedback. */
const SUPPORT_PREFIXES = [
  "/ajuda",
  "/feedback",
  "/termos",
  "/seguranca",
  "/suporte",
  "/legal",
  "/privacidade",
] as const;

/** Normaliza a rota removendo hash, query e barra final (exceto na raiz). */
export function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const trimmed = withoutQuery.replace(/\/+$/, "");
  return trimmed.length === 0 ? "/" : trimmed.toLowerCase();
}

/**
 * Detecção determinística do layout ativo. Função pura: o mesmo caminho sempre
 * resolve para o mesmo contexto, sem depender do DOM.
 */
export function resolveTopBarContext(pathname: string): TopBarContextKey {
  const path = normalizePathname(pathname);

  if (path === "/") return "landing";
  if (path === "/download" || path.startsWith("/download/")) return "download";
  if (path === "/clientes" || path.startsWith("/clientes/")) return "clientes";
  if (path === "/tatuadores" || path.startsWith("/tatuadores/")) return "tatuadores";
  if (SUPPORT_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return "support";
  }

  return "landing";
}

const LANDING: TopBarConfig = {
  context: "landing",
  ariaLabel: "Navegação da landing",
  accent: "orange",
  items: [
    { id: "clientes", label: "Clientes", icon: "users", kind: "route", href: "/clientes", transition: "nav-forward" },
    { id: "tatuadores", label: "Tatuadores", icon: "palette", kind: "route", href: "/tatuadores", transition: "nav-forward" },
    { id: "download", label: "Download", icon: "download", kind: "route", href: "/download", transition: "nav-forward" },
    { id: "ajuda", label: "Ajuda", icon: "help", kind: "anchor", sectionId: "security" },
    { id: "feedback", label: "Feedback", icon: "feedback", kind: "action", actionId: "open-feedback", fallbackHref: "/#waitlist" },
  ],
};

const DOWNLOAD: TopBarConfig = {
  context: "download",
  ariaLabel: "Navegação do download",
  accent: "orange",
  items: [
    { id: "instalar", label: "Instalar", icon: "download", kind: "anchor", sectionId: "download-top" },
    { id: "plataformas", label: "Plataformas", icon: "mobile", kind: "action", actionId: "open-platforms", fallbackHref: "/#waitlist" },
    { id: "lista-vip", label: "Lista VIP", icon: "crown", kind: "route", href: "/#waitlist", transition: "nav-back" },
    { id: "ajuda", label: "Ajuda", icon: "help", kind: "action", actionId: "open-help", fallbackHref: "/#security" },
    { id: "termos", label: "Termos", icon: "terms", kind: "action", actionId: "open-terms", fallbackHref: "/#security" },
  ],
};

const CLIENTES: TopBarConfig = {
  context: "clientes",
  ariaLabel: "Navegação para clientes",
  accent: "orange",
  items: [
    { id: "explorar", label: "Explorar", icon: "compass", kind: "anchor", sectionId: "clientes-top" },
    { id: "estilos", label: "Estilos", icon: "sparkles", kind: "anchor", sectionId: "estilos" },
    { id: "mapa", label: "Mapa", icon: "map", kind: "action", actionId: "open-map", fallbackHref: "/#waitlist" },
    { id: "orcamento", label: "Orçamento", icon: "budget", kind: "action", actionId: "open-budget", fallbackHref: "/#waitlist" },
    { id: "feedback", label: "Feedback", icon: "feedback", kind: "action", actionId: "open-feedback", fallbackHref: "/#waitlist" },
  ],
};

const TATUADORES: TopBarConfig = {
  context: "tatuadores",
  ariaLabel: "Navegação para tatuadores",
  accent: "green",
  items: [
    { id: "painel", label: "Painel", icon: "dashboard", kind: "anchor", sectionId: "artistas-top" },
    { id: "agenda", label: "Agenda", icon: "calendar", kind: "action", actionId: "open-agenda", fallbackHref: "/#waitlist" },
    { id: "portfolio", label: "Portfólio", icon: "portfolio", kind: "anchor", sectionId: "artist-features" },
    { id: "vip", label: "Entrar / VIP", icon: "login", kind: "route", href: "/#waitlist", transition: "nav-back" },
    { id: "termos", label: "Termos", icon: "terms", kind: "action", actionId: "open-terms", fallbackHref: "/#security" },
  ],
};

const SUPPORT: TopBarConfig = {
  context: "support",
  ariaLabel: "Navegação de suporte e legal",
  accent: "orange",
  items: [
    { id: "feedback", label: "Feedback", icon: "feedback", kind: "action", actionId: "open-feedback", fallbackHref: "/#waitlist" },
    { id: "ajuda", label: "Ajuda", icon: "help", kind: "action", actionId: "open-help", fallbackHref: "/#security" },
    { id: "seguranca", label: "Segurança", icon: "shield", kind: "anchor", sectionId: "security" },
    { id: "termos", label: "Termos", icon: "terms", kind: "action", actionId: "open-terms", fallbackHref: "/#security" },
  ],
};

/** Configuração imutável por layout. */
export const TOP_BAR_CONFIGS: Record<TopBarContextKey, TopBarConfig> = {
  landing: LANDING,
  download: DOWNLOAD,
  clientes: CLIENTES,
  tatuadores: TATUADORES,
  support: SUPPORT,
};

export function getTopBarConfig(pathname: string): TopBarConfig {
  return TOP_BAR_CONFIGS[resolveTopBarContext(pathname)];
}

function matchesRoute(pathname: string, href: string): boolean {
  const path = normalizePathname(pathname);
  const target = normalizePathname(href.split("#")[0] ?? "/");
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}

/**
 * Estado ativo. Rotas comparam caminho normalizado; âncoras dependem da seção
 * visível observada passivamente; ações nunca ficam "presas" como ativas.
 */
export function isTopBarItemActive(
  item: TopBarItem,
  pathname: string,
  activeSectionId: string | null,
): boolean {
  switch (item.kind) {
    case "route":
      return matchesRoute(pathname, item.href);
    case "anchor":
      return activeSectionId !== null && activeSectionId === item.sectionId;
    case "action":
      return false;
    default: {
      const exhaustive: never = item;
      return exhaustive;
    }
  }
}

/** Ações exigidas pelo roteiro, centralizadas para testes e para o Passo 2. */
export const TOP_BAR_ACTION_IDS = [
  "open-feedback",
  "open-platforms",
  "open-help",
  "open-terms",
  "open-map",
  "open-budget",
  "open-agenda",
] as const;

export type TopBarActionId = (typeof TOP_BAR_ACTION_IDS)[number];
