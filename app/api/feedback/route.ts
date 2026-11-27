import { feedbackSchema } from "@/lib/validations/feedback";

/**
 * Recebimento de feedback rápido e pedidos de orçamento vindos da barra
 * superior. Segue exatamente o contrato do `/api/waitlist`: validação Zod,
 * honeypot, rate limit por IP e encaminhamento opcional para um backend
 * configurado por variável de ambiente. Nenhum dado pessoal é registrado em
 * log nem devolvido na resposta.
 */

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const ipRequests = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(ip: string, now: number): boolean {
  const entry = ipRequests.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  entry.count += 1;
  return false;
}

/** Limpa o estado em memória entre testes automatizados. */
export function resetFeedbackStoreForTests() {
  ipRequests.clear();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Payload inválido." },
      { status: 400 },
    );
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      },
      { status: 400 },
    );
  }

  // Honeypot: responde sucesso silencioso sem encaminhar nada.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return Response.json(
      { ok: true, message: "Mensagem recebida." },
      { status: 201 },
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip, Date.now())) {
    return Response.json(
      {
        ok: false,
        error: "Muitas mensagens em pouco tempo. Aguarde um minuto.",
      },
      { status: 429 },
    );
  }

  const { kind } = parsed.data;
  const upstreamUrl = process.env.FEEDBACK_BACKEND_URL;

  if (upstreamUrl) {
    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(8_000),
      });

      if (!upstreamResponse.ok) {
        return Response.json(
          {
            ok: false,
            error: "Não foi possível enviar sua mensagem agora. Tente novamente.",
          },
          { status: 502 },
        );
      }
    } catch {
      return Response.json(
        {
          ok: false,
          error: "Serviço temporariamente indisponível. Tente novamente em instantes.",
        },
        { status: 502 },
      );
    }
  }

  return Response.json(
    {
      ok: true,
      kind,
      message:
        kind === "budget"
          ? "Pedido de orçamento recebido."
          : "Feedback recebido. Obrigado!",
    },
    { status: 201 },
  );
}
