import {
  TOP_BAR_ACCENTS,
  TOP_BAR_ACTION_IDS,
  type TopBarAccent,
  type TopBarActionId,
  type TopBarContextKey,
} from "@/lib/topBarConfig";

/**
 * Registro tipado das respostas reais de cada `actionId` da barra superior.
 *
 * Um único `TopBarActionSheet` renderiza estes painéis, então não existe modal
 * duplicado por layout. O conteúdo abaixo reutiliza a promessa já publicada nas
 * seções do site (mapa, orçamento, agenda, plataformas e segurança) e é a fonte
 * de verdade para UI e testes.
 */

export type TopBarPanelFaqItem = {
  readonly question: string;
  readonly answer: string;
};

export type TopBarPanelListItem = {
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
};

export type TopBarPanelCta = {
  readonly label: string;
  readonly href: string;
};

export type TopBarPanelBody =
  | { readonly type: "feedback" }
  | { readonly type: "budget" }
  | { readonly type: "faq"; readonly items: readonly TopBarPanelFaqItem[] }
  | {
      readonly type: "list";
      readonly items: readonly TopBarPanelListItem[];
      readonly cta?: TopBarPanelCta;
    };

export type TopBarPanel = {
  readonly id: TopBarActionId;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly accent: TopBarAccent;
  readonly body: TopBarPanelBody;
};

export const TOP_BAR_PANEL_TITLE_ID = "topbar-action-sheet-title";
export const TOP_BAR_PANEL_ID = "topbar-action-sheet";

const HELP_FAQS: Record<TopBarContextKey, readonly TopBarPanelFaqItem[]> = {
  landing: [
    {
      question: "O que é o TattooGo MK?",
      answer:
        "É o PWA que conecta clientes e tatuadores com portfólio verificado, mapa de estúdios e orçamentos transparentes — do primeiro traço à sessão confirmada.",
    },
    {
      question: "Já consigo baixar o app?",
      answer:
        "A publicação na App Store e no Google Play está em fase final. Quem entra na lista VIP recebe o convite de acesso antes do lançamento público.",
    },
    {
      question: "Quem define o preço da tatuagem?",
      answer:
        "O tatuador. O TattooGo MK organiza referências, medidas e região do corpo para que o orçamento chegue claro — não intermediamos valores nem cobramos comissão sobre a arte.",
    },
    {
      question: "Meus dados e minha arte ficam protegidos?",
      answer:
        "Conversas, referências e dados de perfil usam criptografia AES-256, verificação por OTP e tratamento conforme a LGPD.",
    },
  ],
  download: [
    {
      question: "Quando o app chega à App Store e ao Google Play?",
      answer:
        "O envio para as lojas está em fase final de revisão. A lista VIP recebe o link de instalação assim que a publicação for aprovada.",
    },
    {
      question: "Dá para usar hoje, sem instalar?",
      answer:
        "Sim. O TattooGo MK é um PWA: abre no navegador do celular e pode ser adicionado à tela de início pelo menu do navegador, sem passar pelas lojas.",
    },
    {
      question: "Entrar na lista VIP é pago?",
      answer:
        "Não. A lista VIP é gratuita e serve apenas para avisar sobre o lançamento. Sem cobrança e sem spam.",
    },
    {
      question: "Quais versões são compatíveis?",
      answer:
        "iOS 16 ou superior, Android 9 ou superior e navegadores atuais com suporte a PWA (Chrome, Edge, Safari e Firefox recentes).",
    },
  ],
  clientes: [
    {
      question: "Como encontro um tatuador perto de mim?",
      answer:
        "No Mapa Imersivo você filtra por estilo, distância e disponibilidade. A localização é aproximada e só é usada para ordenar resultados.",
    },
    {
      question: "Como peço um orçamento?",
      answer:
        "Escolha o artista, envie referências, tamanho aproximado e a região do corpo. O valor e o tempo de sessão voltam direto do tatuador pelo chat.",
    },
    {
      question: "Preciso ter a arte pronta para conversar?",
      answer:
        "Não. O Assistente de IA (TattooGo Studio) ajuda a transformar ideias soltas em referências visuais para o briefing.",
    },
    {
      question: "O TattooGo MK cobra pela busca?",
      answer:
        "A busca, o mapa e o contato com artistas são gratuitos para clientes.",
    },
  ],
  tatuadores: [
    {
      question: "Como funciona a verificação do portfólio?",
      answer:
        "Você envia o portfólio e a identidade é confirmada por OTP. Perfis verificados ganham selo e prioridade no mapa.",
    },
    {
      question: "Consigo organizar minha agenda pelo app?",
      answer:
        "Sim: pedidos de orçamento, horários de sessão e status (pedido, confirmado, concluído) ficam na mesma semana, sem planilhas paralelas.",
    },
    {
      question: "Como recebo pelos trabalhos?",
      answer:
        "Valores combinados e sinais ficam registrados no painel, com histórico por sessão. O repasse é feito diretamente entre você e o cliente.",
    },
    {
      question: "Preciso pagar para aparecer no mapa?",
      answer:
        "Não há cobrança para criar perfil nem para aparecer na busca durante o lançamento.",
    },
  ],
  support: [
    {
      question: "Como falo com o suporte?",
      answer:
        "Use o item Feedback da barra superior: a mensagem chega à equipe do TattooGo MK com o contexto da página em que você está.",
    },
    {
      question: "Como peço a exclusão dos meus dados (LGPD)?",
      answer:
        "Envie o pedido pelo Feedback informando o e-mail da conta. A solicitação é tratada conforme os prazos da LGPD.",
    },
    {
      question: "Onde encontro os Termos de Uso?",
      answer:
        "No item Termos da barra superior você lê o resumo de uso, privacidade, cookies e propriedade intelectual sem sair da página.",
    },
    {
      question: "Como denuncio um perfil ou mensagem?",
      answer:
        "Envie um Feedback com o tipo Problema e o nome do perfil. Denúncias são revisadas pela equipe de confiança e segurança.",
    },
  ],
};

const PLATFORM_ITEMS: readonly TopBarPanelListItem[] = [
  {
    badge: "iOS",
    title: "iPhone e iPad",
    description:
      "App nativo para iOS 16 ou superior, com agendamento, chat e mapa. Publicação em revisão na App Store.",
  },
  {
    badge: "Android",
    title: "Android",
    description:
      "App para Android 9 ou superior, com o mesmo fluxo de orçamento e painel de sessões. Em revisão no Google Play.",
  },
  {
    badge: "PWA",
    title: "Navegador (instalável)",
    description:
      "Funciona hoje em Chrome, Edge, Safari e Firefox atuais. No menu do navegador, escolha “Adicionar à tela de início”.",
  },
  {
    badge: "Requisitos",
    title: "O que você precisa",
    description:
      "Conexão estável para o mapa e o chat. Câmera e galeria só são acessadas quando você decide anexar uma referência.",
  },
];

const MAP_ITEMS: readonly TopBarPanelListItem[] = [
  {
    badge: "Proximidade",
    title: "Estúdios perto de você",
    description:
      "O mapa ordena estúdios e artistas pela distância aproximada, sem exigir endereço exato para começar a buscar.",
  },
  {
    badge: "Filtros",
    title: "Estilo e disponibilidade",
    description:
      "Combine realismo, fine line, blackwork e outros estilos com a agenda aberta de cada artista.",
  },
  {
    badge: "Confiança",
    title: "Perfis verificados",
    description:
      "Selo de verificação e portfólio revisado aparecem direto no pino do mapa antes de você abrir o chat.",
  },
  {
    badge: "Privacidade",
    title: "Sua localização sob controle",
    description:
      "A posição é usada apenas para ordenar resultados e nunca é exibida publicamente nem compartilhada com artistas.",
  },
];

const AGENDA_ITEMS: readonly TopBarPanelListItem[] = [
  {
    badge: "Semana",
    title: "Agenda em uma tela",
    description:
      "Pedidos de orçamento e sessões confirmadas na mesma visão semanal, com duração estimada por peça.",
  },
  {
    badge: "Status",
    title: "Pedido, confirmado, concluído",
    description:
      "Cada sessão percorre um estado claro, então cliente e artista enxergam a mesma informação.",
  },
  {
    badge: "Financeiro",
    title: "Sinais e valores registrados",
    description:
      "O valor combinado e o sinal ficam anexados à sessão, formando o histórico de recebimentos do estúdio.",
  },
  {
    badge: "Lembretes",
    title: "Menos mensagens perdidas",
    description:
      "Lembretes de horário reduzem faltas e reorganizam a semana quando uma sessão precisa mudar.",
  },
];

const TERMS_ITEMS: readonly TopBarPanelListItem[] = [
  {
    badge: "Uso",
    title: "Termos de Uso",
    description:
      "O TattooGo MK aproxima clientes e tatuadores. O contrato da tatuagem, o valor e a execução são acordados diretamente entre as partes, sempre com idade mínima de 18 anos.",
  },
  {
    badge: "LGPD",
    title: "Privacidade e dados pessoais",
    description:
      "Coletamos apenas o necessário para conta, contato e segurança: e-mail, perfil e referências enviadas. Você pode pedir acesso, correção ou exclusão a qualquer momento pelo Feedback.",
  },
  {
    badge: "Cookies",
    title: "Cookies e medição",
    description:
      "Usamos armazenamento essencial para sessão e preferências. Métricas agregadas, quando ativas, não identificam você individualmente.",
  },
  {
    badge: "Conteúdo",
    title: "Propriedade intelectual",
    description:
      "Cada artista mantém os direitos do próprio portfólio. Imagens enviadas por clientes são usadas apenas para viabilizar o orçamento solicitado.",
  },
  {
    badge: "Contato",
    title: "Encarregado de dados (DPO)",
    description:
      "Solicitações formais de privacidade são recebidas pelo Feedback com o tipo Problema e respondidas pela equipe da Gafisx Labs.",
  },
];

const accentFor = (context: TopBarContextKey): TopBarAccent =>
  context === "tatuadores" ? "green" : "orange";

function buildPanels(context: TopBarContextKey): Record<TopBarActionId, TopBarPanel> {
  const accent = accentFor(context);

  return {
    "open-feedback": {
      id: "open-feedback",
      eyebrow: "Fale com a equipe",
      title: "Feedback rápido",
      description:
        "Conte o que funcionou ou o que precisa melhorar. Sua mensagem vai para a equipe do TattooGo MK com o contexto desta página.",
      accent,
      body: { type: "feedback" },
    },
    "open-help": {
      id: "open-help",
      eyebrow: "Central de ajuda",
      title: "Dúvidas frequentes",
      description:
        "Respostas diretas para o momento em que você está no TattooGo MK. Se não resolver, envie um Feedback.",
      accent,
      body: { type: "faq", items: HELP_FAQS[context] },
    },
    "open-platforms": {
      id: "open-platforms",
      eyebrow: "Compatibilidade",
      title: "Onde o TattooGo MK roda",
      description:
        "iOS, Android e navegador. A mesma conta e o mesmo histórico em qualquer plataforma.",
      accent,
      body: {
        type: "list",
        items: PLATFORM_ITEMS,
        cta: { label: "Entrar na lista VIP", href: "/#waitlist" },
      },
    },
    "open-map": {
      id: "open-map",
      eyebrow: "Mapa imersivo",
      title: "Encontre quem tatua perto de você",
      description:
        "Distância aproximada, estilo e disponibilidade no mesmo lugar — com perfis verificados antes do primeiro contato.",
      accent,
      body: {
        type: "list",
        items: MAP_ITEMS,
        cta: { label: "Ver recursos de clientes", href: "/clientes#client-features" },
      },
    },
    "open-budget": {
      id: "open-budget",
      eyebrow: "Orçamento",
      title: "Peça uma estimativa",
      description:
        "Descreva a ideia, o estilo e o local do corpo. O pedido vai para a equipe e volta com o próximo passo do orçamento.",
      accent,
      body: { type: "budget" },
    },
    "open-agenda": {
      id: "open-agenda",
      eyebrow: "Painel do tatuador",
      title: "Agenda e sessões sob controle",
      description:
        "Pedidos, confirmações e recebimentos na mesma semana. Veja como o painel organiza a rotina do estúdio.",
      accent,
      body: {
        type: "list",
        items: AGENDA_ITEMS,
        cta: { label: "Ver painel do tatuador", href: "/tatuadores#artist-features" },
      },
    },
    "open-terms": {
      id: "open-terms",
      eyebrow: "Legal",
      title: "Termos, privacidade e LGPD",
      description:
        "Resumo claro das regras de uso do TattooGo MK, do tratamento de dados e dos seus direitos — sem sair da página.",
      accent,
      body: {
        type: "list",
        items: TERMS_ITEMS,
        cta: { label: "Falar sobre privacidade", href: "/#waitlist" },
      },
    },
  };
}

const PANELS_BY_CONTEXT: Record<TopBarContextKey, Record<TopBarActionId, TopBarPanel>> = {
  landing: buildPanels("landing"),
  download: buildPanels("download"),
  clientes: buildPanels("clientes"),
  tatuadores: buildPanels("tatuadores"),
  support: buildPanels("support"),
};

export function isTopBarActionId(value: string): value is TopBarActionId {
  return (TOP_BAR_ACTION_IDS as readonly string[]).includes(value);
}

/**
 * Resolve o painel de uma ação. Retorna `null` quando o `actionId` não existe
 * no contrato — o chamador então aplica o fallback de rota.
 */
export function resolveTopBarPanel(
  actionId: string,
  context: TopBarContextKey,
): TopBarPanel | null {
  if (!isTopBarActionId(actionId)) return null;
  return PANELS_BY_CONTEXT[context][actionId];
}

export function getHelpFaq(context: TopBarContextKey): readonly TopBarPanelFaqItem[] {
  return HELP_FAQS[context];
}

export const TOP_BAR_PANEL_ACCENT_COLORS = TOP_BAR_ACCENTS;
