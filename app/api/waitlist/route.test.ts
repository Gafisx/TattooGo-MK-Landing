import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST, resetWaitlistStoreForTests } from "@/app/api/waitlist/route";

function makeRequest(body: unknown, ip = "198.51.100.1") {
  return new Request("http://localhost:3000/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    resetWaitlistStoreForTests();
    delete process.env.WAITLIST_BACKEND_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.WAITLIST_BACKEND_URL;
  });

  it("cadastra e-mail válido normalizado com perfil escolhido", async () => {
    const response = await POST(
      makeRequest({ email: "  Artista@MK.com ", role: "tatuador" }),
    );
    const data = (await response.json()) as {
      ok: boolean;
      message: string;
      role: string;
    };

    expect(response.status).toBe(201);
    expect(data).toEqual({
      ok: true,
      message: "Você está na lista!",
      role: "tatuador",
    });
  });

  it("rejeita JSON inválido e e-mail inválido com 400", async () => {
    const malformed = await POST(makeRequest("{invalid-json"));
    expect(malformed.status).toBe(400);

    const invalidEmail = await POST(makeRequest({ email: "invalido" }));
    expect(invalidEmail.status).toBe(400);
    const payload = (await invalidEmail.json()) as { ok: boolean; error: string };
    expect(payload.ok).toBe(false);
    expect(payload.error).toBe("Por favor, insira um e-mail válido.");
  });

  it("retorna 409 para e-mail duplicado", async () => {
    const first = await POST(makeRequest({ email: "duplicado@mk.com" }, "198.51.100.2"));
    expect(first.status).toBe(201);

    const second = await POST(makeRequest({ email: "DUPLICADO@mk.com" }, "198.51.100.3"));
    expect(second.status).toBe(409);
  });

  it("aceita silenciosamente sem persistir quando honeypot está preenchido", async () => {
    const bot = await POST(
      makeRequest({ email: "bot@mk.com", website: "https://spam.example" }),
    );
    expect(bot.status).toBe(201);

    // Como o honeypot não persistiu, o mesmo e-mail ainda pode se cadastrar legitimamente.
    const real = await POST(makeRequest({ email: "bot@mk.com" }, "198.51.100.4"));
    expect(real.status).toBe(201);
  });

  it("aplica rate limit por IP acima de 5 requisições", async () => {
    for (let i = 0; i < 5; i += 1) {
      const res = await POST(
        makeRequest({ email: `user${i}@mk.com` }, "198.51.100.99"),
      );
      expect(res.status).toBe(201);
    }

    const blocked = await POST(
      makeRequest({ email: "user6@mk.com" }, "198.51.100.99"),
    );
    expect(blocked.status).toBe(429);
  });

  it("encaminha para WAITLIST_BACKEND_URL quando configurado", async () => {
    process.env.WAITLIST_BACKEND_URL = "https://backend.example.com/api/waitlist";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 201 }));

    const res = await POST(
      makeRequest({ email: "render@mk.com", role: "cliente" }),
    );
    expect(res.status).toBe(201);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://backend.example.com/api/waitlist",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("retorna 502 se WAITLIST_BACKEND_URL falhar", async () => {
    process.env.WAITLIST_BACKEND_URL = "https://backend.example.com/api/waitlist";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    const res = await POST(makeRequest({ email: "erro@mk.com" }));
    expect(res.status).toBe(502);
  });
});
