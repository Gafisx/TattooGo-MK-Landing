import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST, resetWaitlistStoreForTests } from "@/app/api/waitlist/route";

const ENDPOINT = "http://localhost/api/waitlist";

function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    resetWaitlistStoreForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("rejeita corpo que não é JSON", async () => {
    const response = await POST(jsonRequest("{nao-e-json"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Payload inválido.",
    });
  });

  it("rejeita dados fora do schema com a mensagem de validação", async () => {
    const response = await POST(jsonRequest({ email: "invalido" }));

    expect(response.status).toBe(400);
    const body = (await response.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error.length).toBeGreaterThan(0);
  });

  it("registra a inscrição normalizando o e-mail e usando o papel padrão", async () => {
    const response = await POST(jsonRequest({ email: "  Artista@Studio.COM " }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: "Você está na lista!",
      role: "cliente",
    });
  });

  it("preserva o papel escolhido e bloqueia e-mails repetidos", async () => {
    const first = await POST(
      jsonRequest({ email: "tattoo@studio.com", role: "tatuador" }),
    );
    expect(first.status).toBe(201);
    await expect(first.json()).resolves.toMatchObject({ role: "tatuador" });

    const duplicate = await POST(jsonRequest({ email: "TATTOO@studio.com" }));
    expect(duplicate.status).toBe(409);
    await expect(duplicate.json()).resolves.toEqual({
      ok: false,
      error: "Este e-mail já está na lista VIP.",
    });
  });

  it("responde sucesso silencioso no honeypot sem persistir o e-mail", async () => {
    const honeypot = await POST(
      jsonRequest({ email: "bot@spam.com", website: "https://spam.example" }),
    );
    expect(honeypot.status).toBe(201);
    await expect(honeypot.json()).resolves.toEqual({
      ok: true,
      message: "Inscrição recebida.",
    });

    const reused = await POST(jsonRequest({ email: "bot@spam.com" }));
    expect(reused.status).toBe(201);
  });

  it("limita a cinco inscrições por IP na mesma janela de um minuto", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const headers = { "x-forwarded-for": "203.0.113.7, 10.0.0.1" };

    for (let index = 0; index < 5; index += 1) {
      const response = await POST(
        jsonRequest({ email: `pessoa-${index}@studio.com` }, headers),
      );
      expect(response.status).toBe(201);
    }

    const blocked = await POST(
      jsonRequest({ email: "pessoa-bloqueada@studio.com" }, headers),
    );
    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toEqual({
      ok: false,
      error: "Muitas tentativas. Aguarde um minuto e tente novamente.",
    });

    vi.setSystemTime(new Date("2026-01-01T00:01:01.000Z"));
    const afterWindow = await POST(
      jsonRequest({ email: "pessoa-liberada@studio.com" }, headers),
    );
    expect(afterWindow.status).toBe(201);
  });

  it("identifica o cliente por x-real-ip quando não há x-forwarded-for", async () => {
    const response = await POST(
      jsonRequest({ email: "real-ip@studio.com" }, { "x-real-ip": " 198.51.100.9 " }),
    );

    expect(response.status).toBe(201);
  });

  it("trata cabeçalhos de IP vazios como cliente desconhecido", async () => {
    const emptyForwarded = await POST(
      jsonRequest({ email: "vazio@studio.com" }, { "x-forwarded-for": " , 10.1.1.1" }),
    );
    expect(emptyForwarded.status).toBe(201);

    const noHeaders = await POST(jsonRequest({ email: "sem-ip@studio.com" }));
    expect(noHeaders.status).toBe(201);
  });

  it("encaminha a inscrição ao backend configurado", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("WAITLIST_BACKEND_URL", "https://api.example.com/waitlist");

    const response = await POST(
      jsonRequest({ email: "upstream@studio.com", role: "tatuador" }),
    );

    expect(response.status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/waitlist",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "upstream@studio.com", role: "tatuador" }),
      }),
    );
  });

  it("devolve 502 quando o backend rejeita a inscrição", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );
    vi.stubEnv("WAITLIST_BACKEND_URL", "https://api.example.com/waitlist");

    const response = await POST(jsonRequest({ email: "falha@studio.com" }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Não foi possível confirmar sua inscrição agora. Tente novamente.",
    });
  });

  it("devolve 502 quando o backend está inacessível", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    vi.stubEnv("WAITLIST_BACKEND_URL", "https://api.example.com/waitlist");

    const response = await POST(jsonRequest({ email: "offline@studio.com" }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Serviço temporariamente indisponível. Tente novamente em instantes.",
    });
  });
});
