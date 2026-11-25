import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WaitlistSection from "@/components/WaitlistSection";

const submit = (container: HTMLElement) => {
  const form = container.querySelector("form");
  if (!form) throw new Error("WaitlistSection não renderizou o formulário");
  fireEvent.submit(form);
};

describe("WaitlistSection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza a chamada, seletor de perfil e o campo de e-mail", () => {
    render(<WaitlistSection />);

    expect(screen.getByRole("heading", { name: "A agulha está quase pronta." }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sou Cliente" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Sou Tatuador" })).toHaveAttribute("aria-pressed", "false");
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

  it("envia perfil e e-mail para /api/waitlist e confirma a inscrição", async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { container } = render(<WaitlistSection />);
    fireEvent.click(screen.getByRole("button", { name: "Sou Tatuador" }));
    const input = screen.getByPlaceholderText("Seu melhor e-mail");

    fireEvent.change(input, { target: { value: "  Artista@MK.com " } });
    submit(container);

    expect(screen.getByText("Enviando...")).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/waitlist",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "artista@mk.com",
          role: "tatuador",
          website: "",
        }),
      }),
    );

    resolveFetch(
      new Response(JSON.stringify({ ok: true, message: "Você está na lista!" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(await screen.findByText("Você está na lista!")).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toBeDisabled();
  });

  it("exibe erro retornado pela API e em falha de rede", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: false, error: "Este e-mail já está na lista VIP." }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { container } = render(<WaitlistSection />);
    const input = screen.getByPlaceholderText("Seu melhor e-mail");

    fireEvent.change(input, { target: { value: "artista@mk.com" } });
    submit(container);

    expect(await screen.findByText("Este e-mail já está na lista VIP.")).toBeInTheDocument();

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));
    submit(container);

    await waitFor(() => {
      expect(
        screen.getByText("Ocorreu um erro. Tente novamente mais tarde."),
      ).toBeInTheDocument();
    });
  });
});
