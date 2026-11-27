import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ReactNode } from "react";

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
  usePrefersReducedMotion: () => true,
}));

import TopBarActionSheet from "@/components/topbar/TopBarActionSheet";
import { TOP_BAR_ACTION_EVENT } from "@/components/ui/AppleTopBar";
import {
  closeTopBarAction,
  getTopBarActionState,
  resetTopBarActionStoreForTests,
} from "@/lib/topBarActionStore";
import type { TopBarContextKey } from "@/lib/topBarConfig";

function dispatchAction(actionId: string, context: TopBarContextKey = "landing") {
  const event = new CustomEvent(TOP_BAR_ACTION_EVENT, {
    detail: { actionId, context },
    cancelable: true,
  });
  let notCanceled = true;
  act(() => {
    notCanceled = window.dispatchEvent(event);
  });
  return notCanceled;
}

function renderSheetWithTrigger() {
  return render(
    <>
      <button type="button">gatilho da barra</button>
      <TopBarActionSheet />
    </>,
  );
}

describe("TopBarActionSheet", () => {
  beforeEach(() => {
    resetTopBarActionStoreForTests();
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  afterEach(() => {
    closeTopBarAction();
  });

  test("abre diálogo acessível ao receber o evento e cancela o fallback", () => {
    renderSheetWithTrigger();

    const notCanceled = dispatchAction("open-help");

    expect(notCanceled).toBe(false);
    const dialog = screen.getByRole("dialog", { name: "Dúvidas frequentes" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("id", "topbar-action-sheet");
    expect(screen.getByText("Central de ajuda")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("ação desconhecida não abre nada nem cancela o evento", () => {
    renderSheetWithTrigger();

    const notCanceled = dispatchAction("open-desconhecida");

    expect(notCanceled).toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(getTopBarActionState()).toBeNull();
  });

  test("Escape fecha, restaura a rolagem e devolve o foco ao gatilho", async () => {
    renderSheetWithTrigger();
    const trigger = screen.getByRole("button", { name: "gatilho da barra" });
    trigger.focus();

    dispatchAction("open-terms");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(getTopBarActionState()).toBeNull();
    });
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(trigger);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  test("clique fora (backdrop) fecha sem deslocar a página", async () => {
    Object.defineProperty(window, "scrollY", {
      value: 1200,
      configurable: true,
      writable: true,
    });

    renderSheetWithTrigger();
    dispatchAction("open-map", "clientes");

    const layer = document.querySelector("[data-topbar-action-layer]");
    const backdrop = layer?.firstElementChild;
    expect(backdrop).toBeInstanceOf(HTMLElement);

    fireEvent.mouseDown(backdrop as HTMLElement);

    await waitFor(() => {
      expect(getTopBarActionState()).toBeNull();
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(window.scrollY).toBe(1200);
    expect(document.body.style.overflow).toBe("");
  });

  test("FAQ de ajuda abre por padrão como details acessível", () => {
    renderSheetWithTrigger();
    dispatchAction("open-help", "tatuadores");

    expect(
      screen.getByText("Como funciona a verificação do portfólio?"),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Portfólio|agenda/i).length).toBeGreaterThan(0);
  });

  test("painel de plataformas lista compatibilidade e CTA real", () => {
    renderSheetWithTrigger();
    dispatchAction("open-platforms", "download");

    expect(screen.getByText("iPhone e iPad")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Android" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar na lista VIP" })).toHaveAttribute(
      "href",
      "/#waitlist",
    );
  });

  test("formulário de feedback envia de verdade e confirma", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: "Feedback recebido. Obrigado!" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderSheetWithTrigger();
    dispatchAction("open-feedback");

    fireEvent.change(screen.getByLabelText("Seu e-mail"), {
      target: { value: "cliente@mk.com" },
    });
    fireEvent.change(screen.getByLabelText("Mensagem"), {
      target: { value: "O mapa carregou rápido e o orçamento chegou claro." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar feedback" }));

    expect(await screen.findByText("Enviado")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Feedback recebido. Obrigado!",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/feedback");
    expect(JSON.parse(String(init.body))).toMatchObject({
      kind: "feedback",
      email: "cliente@mk.com",
      context: "landing",
    });
  });

  test("pedido de orçamento usa o formulário de budget", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, message: "Pedido de orçamento recebido." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderSheetWithTrigger();
    dispatchAction("open-budget", "clientes");

    fireEvent.change(screen.getByLabelText("Seu e-mail"), {
      target: { value: "cliente@mk.com" },
    });
    fireEvent.change(screen.getByLabelText("Descreva a ideia"), {
      target: { value: "Peça de 15 cm no antebraço, traço fino." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar pedido" }));

    expect(await screen.findByText("Enviado")).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toMatchObject({
      kind: "budget",
      context: "clientes",
    });
  });

  test("erro de validação é anunciado sem chamar a API", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderSheetWithTrigger();
    dispatchAction("open-feedback");

    fireEvent.change(screen.getByLabelText("Seu e-mail"), {
      target: { value: "invalido" },
    });
    fireEvent.change(screen.getByLabelText("Mensagem"), {
      target: { value: "curto" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar feedback" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/e-mail válido/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
