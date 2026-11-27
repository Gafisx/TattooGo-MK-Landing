import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST, resetFeedbackStoreForTests } from "@/app/api/feedback/route";

function makeRequest(body: unknown, ip = "203.0.113.10") {
  return new Request("http://localhost:3000/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const validFeedback = {
  kind: "feedback" as const,
  email: "cliente@mk.com",
  message: "O mapa carregou rápido no meu celular.",
  category: "elogio" as const,
  context: "clientes" as const,
};

describe("POST /api/feedback", () => {
  beforeEach(() => {
    resetFeedbackStoreForTests();
    delete process.env.FEEDBACK_BACKEND_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.FEEDBACK_BACKEND_URL;
  });

  it("aceita feedback válido e confirma com 201", async () => {
    const response = await POST(makeRequest(validFeedback));
    const data = (await response.json()) as {
      ok: boolean;
      kind: string;
      message: string;
    };

    expect(response.status).toBe(201);
    expect(data.kind).toBe("feedback");
    expect(data.ok).toBe(true);
    expect(data.message).toBe("Feedback recebido. Obrigado!");
  });

  it("aceita pedido de orçamento com estilo e local do corpo", async () => {
    const response = await POST(
      makeRequest({
        kind: "budget",
        email: "orcamento@mk.com",
        message: "Quero uma peça de 15 cm no antebraço.",
        category: "orcamento",
        style: "Fine line",
        placement: "antebraço interno",
        context: "clientes",
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as { message: string };
    expect(data.message).toBe("Pedido de orçamento recebido.");
  });

  it("rejeita JSON inválido, e-mail e mensagem curtos com 400", async () => {
    expect((await POST(makeRequest("{invalid"))).status).toBe(400);

    const badEmail = await POST(
      makeRequest({ ...validFeedback, email: "invalido" }),
    );
    expect(badEmail.status).toBe(400);
    const emailPayload = (await badEmail.json()) as { error: string };
    expect(emailPayload.error).toBe("Por favor, insira um e-mail válido.");

    const shortMessage = await POST(
      makeRequest({ ...validFeedback, message: "curto" }),
    );
    expect(shortMessage.status).toBe(400);
    const messagePayload = (await shortMessage.json()) as { error: string };
    expect(messagePayload.error).toContain("ao menos 10 caracteres");
  });

  it("responde sucesso silencioso sem encaminhar quando o honeypot está preenchido", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const response = await POST(
      makeRequest({ ...validFeedback, website: "https://spam.example" }),
    );

    expect(response.status).toBe(201);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("aplica rate limit por IP acima de 5 mensagens", async () => {
    for (let index = 0; index < 5; index += 1) {
      const res = await POST(makeRequest(validFeedback, "203.0.113.50"));
      expect(res.status).toBe(201);
    }

    const blocked = await POST(makeRequest(validFeedback, "203.0.113.50"));
    expect(blocked.status).toBe(429);
  });

  it("encaminha para FEEDBACK_BACKEND_URL quando configurado", async () => {
    process.env.FEEDBACK_BACKEND_URL = "https://backend.example.com/feedback";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 202 }));

    const response = await POST(makeRequest(validFeedback));
    expect(response.status).toBe(201);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://backend.example.com/feedback",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("retorna 502 quando o backend configurado falha", async () => {
    process.env.FEEDBACK_BACKEND_URL = "https://backend.example.com/feedback";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    const response = await POST(makeRequest(validFeedback));
    expect(response.status).toBe(502);
  });
});
