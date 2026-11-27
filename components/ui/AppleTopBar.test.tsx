import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: { current: "/" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname.current,
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    transitionTypes: _transitionTypes,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    transitionTypes?: unknown;
    [key: string]: unknown;
  }) => {
    void _transitionTypes;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

vi.mock("@/lib/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

vi.mock("@/lib/contextualScroll", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/contextualScroll")>();
  return {
    ...actual,
    scrollToSection: vi.fn(() => true),
  };
});

import AppleTopBar, { TOP_BAR_ACTION_EVENT } from "@/components/ui/AppleTopBar";
import { scrollToSection } from "@/lib/contextualScroll";
import {
  closeTopBarAction,
  openTopBarAction,
  resetTopBarActionStoreForTests,
} from "@/lib/topBarActionStore";

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

class MockIntersectionObserver {
  static last: MockIntersectionObserver | null = null;
  readonly callback: ObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.last = this;
  }
}

function renderBar() {
  return render(
    <>
      <AppleTopBar />
      <section id="security" aria-label="Segurança" />
      <section id="estilos" aria-label="Estilos" />
      <section id="clientes-top" aria-label="Explorar" />
      <input id="waitlist-email" aria-label="E-mail da lista VIP" />
    </>,
  );
}

function triggerSection(sectionId: string, top = 96) {
  const observer = MockIntersectionObserver.last;
  if (!observer) throw new Error("IntersectionObserver não foi criado");
  const target = document.getElementById(sectionId);
  if (!target) throw new Error(`seção ${sectionId} ausente`);
  act(() => {
    observer.callback(
      [
        {
          isIntersecting: true,
          target,
          boundingClientRect: { top } as DOMRect,
        } as unknown as IntersectionObserverEntry,
      ],
      observer as unknown as IntersectionObserver,
    );
  });
}

describe("AppleTopBar", () => {
  beforeEach(() => {
    mocks.pathname.current = "/";
    mocks.push.mockClear();
    vi.mocked(scrollToSection).mockClear();
    vi.mocked(scrollToSection).mockReturnValue(true);
    MockIntersectionObserver.last = null;
    resetTopBarActionStoreForTests();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  test("renderiza o conjunto da landing com rótulos e acessibilidade", () => {
    renderBar();

    const nav = screen.getByRole("navigation", { name: "Navegação da landing" });
    expect(nav).toBeInTheDocument();

    for (const label of ["Clientes", "Tatuadores", "Download", "Ajuda", "Feedback"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Clientes" })).toHaveAttribute("href", "/clientes");
    expect(screen.getByRole("button", { name: "Ajuda" })).toBeInTheDocument();
  });

  test("item não selecionado exibe ícone + rótulo curto", () => {
    renderBar();
    const item = screen.getByRole("link", { name: "Clientes" });

    expect(item).toHaveAttribute("data-state", "idle");
    expect(item).not.toHaveAttribute("aria-current");
    const label = item.querySelector(".tattoo-topbar__label");
    expect(label).toHaveTextContent("Clientes");
    expect(item.querySelector(".tattoo-topbar__icon")).not.toBeNull();
  });

  test("item selecionado recolhe o texto e vira só ícone com aria-current", () => {
    renderBar();
    triggerSection("security");

    const item = screen.getByRole("button", { name: "Ajuda" });
    expect(item).toHaveAttribute("data-state", "active");
    expect(item).toHaveAttribute("aria-current", "location");
    expect(item.className).toContain("tattoo-topbar__item--active");
    // O rótulo permanece no DOM (nome acessível/SEO) e o CSS o colapsa.
    expect(item.querySelector(".tattoo-topbar__label")).toHaveTextContent("Ajuda");
  });

  test("navegação por âncora usa rolagem controlada e marca a seção", () => {
    renderBar();
    fireEvent.click(screen.getByRole("button", { name: "Ajuda" }));

    expect(scrollToSection).toHaveBeenCalledWith("security", expect.objectContaining({ reducedMotion: false }));
    expect(screen.getByRole("button", { name: "Ajuda" })).toHaveAttribute("data-state", "active");
    expect(mocks.push).not.toHaveBeenCalled();
  });

  test("ação direta emite evento tipado e foca o formulário da lista", () => {
    const listener = vi.fn();
    window.addEventListener(TOP_BAR_ACTION_EVENT, listener);
    renderBar();

    fireEvent.click(screen.getByRole("button", { name: "Feedback" }));

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0] as CustomEvent<{ actionId: string; context: string }>;
    expect(event.detail).toEqual({ actionId: "open-feedback", context: "landing" });
    expect(document.activeElement).toBe(screen.getByLabelText("E-mail da lista VIP"));
    expect(mocks.push).not.toHaveBeenCalled();

    window.removeEventListener(TOP_BAR_ACTION_EVENT, listener);
  });

  test("ação tratada pela camada de painéis não executa o fallback de rota", () => {
    const cancel = (event: Event) => event.preventDefault();
    window.addEventListener(TOP_BAR_ACTION_EVENT, cancel);
    renderBar();

    fireEvent.click(screen.getByRole("button", { name: "Feedback" }));

    expect(mocks.push).not.toHaveBeenCalled();
    window.removeEventListener(TOP_BAR_ACTION_EVENT, cancel);
  });

  test("aria-expanded reflete o painel aberto sem marcar o item como ativo", () => {
    renderBar();
    const feedback = screen.getByRole("button", { name: "Feedback" });

    expect(feedback).toHaveAttribute("aria-expanded", "false");

    act(() => openTopBarAction("open-feedback", "landing"));
    expect(feedback).toHaveAttribute("aria-expanded", "true");
    expect(feedback).toHaveAttribute("aria-controls", "topbar-action-sheet");
    expect(feedback).toHaveAttribute("data-state", "idle");

    act(() => closeTopBarAction());
    expect(feedback).toHaveAttribute("aria-expanded", "false");
    expect(feedback).not.toHaveAttribute("aria-controls");
  });

  test("layout de tatuadores troca accent e conjunto de itens", () => {
    mocks.pathname.current = "/tatuadores";
    renderBar();

    const header = document.querySelector("header.tattoo-topbar");
    expect(header).toHaveAttribute("data-topbar-context", "tatuadores");
    expect((header as HTMLElement).style.getPropertyValue("--tb-accent")).toBe("#00FF66");
    expect(screen.getByRole("navigation", { name: "Navegação para tatuadores" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar / VIP" })).toHaveAttribute("href", "/#waitlist");
    expect(screen.getByRole("button", { name: "Painel" })).toHaveAttribute("data-state", "idle");
  });

  test("barra fixa com altura estável (não empurra o conteúdo)", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar");
    expect(header?.className).toContain("fixed");
    expect(header?.className).toContain("top-0");
    const inner = header?.firstElementChild;
    expect(inner?.className).toContain("h-14");
    expect(inner?.className).toContain("max-w-[1440px]");
  });
});
