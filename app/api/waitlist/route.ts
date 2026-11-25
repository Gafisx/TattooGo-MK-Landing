import { waitlistSchema } from "@/lib/validations/waitlist";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const registeredEmails = new Set<string>();
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
export function resetWaitlistStoreForTests() {
  registeredEmails.clear();
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

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      },
      { status: 400 },
    );
  }

  // Honeypot anti-bot: responde sucesso silencioso sem persistir.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return Response.json({ ok: true, message: "Inscrição recebida." }, { status: 201 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip, Date.now())) {
    return Response.json(
      { ok: false, error: "Muitas tentativas. Aguarde um minuto e tente novamente." },
      { status: 429 },
    );
  }

  const { email, role } = parsed.data;
  if (registeredEmails.has(email)) {
    return Response.json(
      { ok: false, error: "Este e-mail já está na lista VIP." },
      { status: 409 },
    );
  }

  const upstreamUrl = process.env.WAITLIST_BACKEND_URL;
  if (upstreamUrl) {
    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!upstreamResponse.ok) {
        return Response.json(
          { ok: false, error: "Não foi possível confirmar sua inscrição agora. Tente novamente." },
          { status: 502 },
        );
      }
    } catch {
      return Response.json(
        { ok: false, error: "Serviço temporariamente indisponível. Tente novamente em instantes." },
        { status: 502 },
      );
    }
  }

  registeredEmails.add(email);

  return Response.json(
    {
      ok: true,
      message: "Você está na lista!",
      role,
    },
    { status: 201 },
  );
}
