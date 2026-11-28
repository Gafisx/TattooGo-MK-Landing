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
  default: ({ children, href, transitionTypes: _t, ...rest }: { children: ReactNode; href: string; transitionTypes?: unknown; [key: string]: unknown }) => {
    void _t;
    return <a href={href} {...rest}>{children}</a>;
  },
}));

vi.mock("@/lib/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => false,
}));

const contextualMocks = vi.hoisted(() => ({
  isContextualScrollActive: vi.fn(() => false),
}));

vi.mock("@/lib/contextualScroll", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/contextualScroll")>();
  return {
    ...actual,
    scrollToSection: vi.fn(() => true),
    isContextualScrollActive: contextualMocks.isContextualScrollActive,
  };
});

import AppleTopBar from "@/components/ui/AppleTopBar";
import {
  closeTopBarAction,
  openTopBarAction,
  resetTopBarActionStoreForTests,
} from "@/lib/topBarActionStore";

class MockIntersectionObserver {
  static last: MockIntersectionObserver | null = null;
  readonly callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.last = this;
  }
}

function renderBar() {
  return render(
    <>
      <AppleTopBar />
      <section id="security" aria-label="Segurança" />
      <input id="waitlist-email" aria-label="E-mail da lista VIP" />
    </>,
  );
}

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    value,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  mocks.pathname.current = "/";
  mocks.push.mockClear();
  contextualMocks.isContextualScrollActive.mockReturnValue(false);
  resetTopBarActionStoreForTests();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  setScrollY(0);
});

describe("AppleTopBar scroll inteligente", () => {
  test("rolagem lenta (micro-movimentos) não recolhe nem exibe", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    // Pequenos deltas acumulados, abaixo do limiar.
    setScrollY(4);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");

    setScrollY(8);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");
  });

  test("descida intencional recolhe a barra para fora do topo", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, -100%, 0)");
    expect(header.classList.contains("tattoo-topbar--hidden")).toBe(true);
  });

  test("subida intencional exibe a barra novamente", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, -100%, 0)");

    setScrollY(120);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");
  });

  test("próximo ao topo mantém a barra visível", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    setScrollY(0);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");
  });

  test("TopBarActionSheet aberto mantém a barra visível", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, -100%, 0)");

    act(() => openTopBarAction("open-feedback", "landing"));
    // Recomputa com trava ativa.
    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");
    act(() => closeTopBarAction());
  });

  test("foco de teclado dentro da barra mantém visível", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;
    const item = screen.getByRole("link", { name: "Clientes" });

    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    // foco dentro da barra força exibição
    act(() => item.focus());
    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");
  });

  test("TattooMenu aberto mantém a barra visível", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, -100%, 0)");

    // Simula menu aberto via DOM.
    const btn = document.createElement("button");
    btn.setAttribute("aria-controls", "tattoo-quick-menu");
    btn.setAttribute("aria-expanded", "true");
    document.body.appendChild(btn);

    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");

    btn.remove();
  });

  test("rolagem programática ativa mantém a barra visível", () => {
    renderBar();
    const header = document.querySelector("header.tattoo-topbar") as HTMLElement;

    contextualMocks.isContextualScrollActive.mockReturnValue(true);
    setScrollY(240);
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(header.style.transform).toBe("translate3d(0, 0, 0)");
  });
});
