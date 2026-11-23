import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WaitlistSection from "@/components/WaitlistSection";

const submit = (container: HTMLElement) => {
  const form = container.querySelector("form");
  if (!form) throw new Error("WaitlistSection não renderizou o formulário");
  fireEvent.submit(form);
};

describe("WaitlistSection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza a chamada e o campo de e-mail", () => {
    render(<WaitlistSection />);

    expect(screen.getByRole("heading", { name: "A agulha está quase pronta." }))
      .toBeInTheDocument();
    expect(screen.getByPlaceholderText("Seu melhor e-mail")).toBeEnabled();
    expect(screen.getByRole("button", { name: /Notificar-me/i })).toBeEnabled();
  });

  it("mostra o erro de validação e limpa ao digitar novamente", () => {
    const { container } = render(<WaitlistSection />);
    const input = screen.getByPlaceholderText("Seu melhor e-mail");

    fireEvent.change(input, { target: { value: "nao-e-email" } });
    submit(container);

    expect(screen.getByText("Por favor, insira um e-mail válido."))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Notificar-me/i })).toBeEnabled();

    fireEvent.change(input, { target: { value: "artista@mk.com" } });
    expect(
      screen.queryByText("Por favor, insira um e-mail válido."),
    ).not.toBeInTheDocument();
  });

  it("entra em loading e confirma a inscrição", async () => {
    const { container } = render(<WaitlistSection />);
    const input = screen.getByPlaceholderText("Seu melhor e-mail");

    fireEvent.change(input, { target: { value: "  Artista@MK.com " } });
    submit(container);

    expect(screen.getByText("Enviando...")).toBeInTheDocument();
    expect(input).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_500);
    });

    expect(screen.getByText("Você está na lista!")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toBeDisabled();
  });
});
