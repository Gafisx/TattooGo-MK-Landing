"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import {
  feedbackSchema,
  type FeedbackCategory,
  type FeedbackKind,
} from "@/lib/validations/feedback";

type TopBarActionFormProps = {
  kind: FeedbackKind;
  context: "landing" | "download" | "clientes" | "tatuadores" | "support";
  accentColor: string;
  onDone?: () => void;
};

const FEEDBACK_CATEGORIES: ReadonlyArray<{
  value: FeedbackCategory;
  label: string;
}> = [
  { value: "elogio", label: "Elogio" },
  { value: "sugestao", label: "Sugestão" },
  { value: "problema", label: "Problema" },
];

const BUDGET_STYLES = [
  "Fine line",
  "Realismo",
  "Blackwork",
  "Old school",
  "Aquarela",
  "Ainda não sei",
] as const;

type Status = "idle" | "loading" | "success" | "error";

/**
 * Formulário real da gaveta de ações: valida com Zod (mesmo schema do servidor),
 * envia para `/api/feedback`, anuncia erro com `role="alert"` e confirma com
 * `role="status"`. Nenhum dado é persistido no cliente.
 */
export default function TopBarActionForm({
  kind,
  context,
  accentColor,
  onDone,
}: TopBarActionFormProps) {
  const fieldId = useId();
  const isBudget = kind === "budget";

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("sugestao");
  const [style, setStyle] = useState<string>(BUDGET_STYLES[0]);
  const [placement, setPlacement] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const isDisabled = status === "loading" || status === "success";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackMessage("");

    const validation = feedbackSchema.safeParse({
      kind,
      email,
      message,
      category: isBudget ? "orcamento" : category,
      context,
      style: isBudget ? style : undefined,
      placement: isBudget ? placement : undefined,
      website,
    });

    if (!validation.success) {
      setStatus("error");
      setFeedbackMessage(
        validation.error.issues[0]?.message ?? "Confira os dados e tente novamente.",
      );
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; message?: string }
        | null;

      if (!response.ok) {
        setStatus("error");
        setFeedbackMessage(
          payload?.error ?? "Não foi possível enviar agora. Tente novamente.",
        );
        return;
      }

      setStatus("success");
      setFeedbackMessage(
        payload?.message ??
          (isBudget
            ? "Pedido de orçamento recebido."
            : "Feedback recebido. Obrigado!"),
      );
      setMessage("");
      setEmail("");
      setPlacement("");
    } catch {
      setStatus("error");
      setFeedbackMessage("Falha de conexão. Tente novamente em instantes.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#00FF66]/30 bg-[#00FF66]/[0.07] p-5">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#00FF66]">
          <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
          Enviado
        </span>
        <p role="status" className="text-sm leading-relaxed text-white/80">
          {feedbackMessage}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setFeedbackMessage("");
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-panel-accent)]"
          >
            Enviar outro
          </button>
          {onDone ? (
            <button
              type="button"
              onClick={onDone}
              className="rounded-full px-4 py-2 text-xs font-semibold text-[#121212] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ backgroundColor: accentColor }}
            >
              Concluir
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {!isBudget ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            Tipo de mensagem
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {FEEDBACK_CATEGORIES.map((option) => {
              const selected = category === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  disabled={isDisabled}
                  onClick={() => setCategory(option.value)}
                  className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tb-panel-accent)] disabled:opacity-50 ${
                    selected
                      ? "border-[color-mix(in_srgb,var(--tb-panel-accent)_60%,transparent)] bg-[color-mix(in_srgb,var(--tb-panel-accent)_16%,transparent)] text-[var(--tb-panel-accent)]"
                      : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {isBudget ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${fieldId}-style`}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55"
            >
              Estilo
            </label>
            <select
              id={`${fieldId}-style`}
              value={style}
              disabled={isDisabled}
              onChange={(event) => setStyle(event.target.value)}
              className="rounded-xl border border-white/15 bg-[#1A1A1A]/80 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[var(--tb-panel-accent)] focus:ring-1 focus:ring-[var(--tb-panel-accent)]/40 disabled:opacity-50"
            >
              {BUDGET_STYLES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${fieldId}-placement`}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55"
            >
              Local do corpo
            </label>
            <input
              id={`${fieldId}-placement`}
              type="text"
              maxLength={60}
              value={placement}
              disabled={isDisabled}
              onChange={(event) => setPlacement(event.target.value)}
              placeholder="Ex.: antebraço interno"
              className="rounded-xl border border-white/15 bg-[#1A1A1A]/80 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-[var(--tb-panel-accent)] focus:ring-1 focus:ring-[var(--tb-panel-accent)]/40 disabled:opacity-50"
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${fieldId}-email`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55"
        >
          Seu e-mail
        </label>
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          disabled={isDisabled}
          aria-invalid={status === "error" ? true : undefined}
          aria-describedby={status === "error" ? `${fieldId}-error` : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="voce@exemplo.com"
          className="rounded-xl border border-white/15 bg-[#1A1A1A]/80 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-[var(--tb-panel-accent)] focus:ring-1 focus:ring-[var(--tb-panel-accent)]/40 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${fieldId}-message`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55"
        >
          {isBudget ? "Descreva a ideia" : "Mensagem"}
        </label>
        <textarea
          id={`${fieldId}-message`}
          name="message"
          required
          rows={4}
          maxLength={1200}
          value={message}
          disabled={isDisabled}
          aria-invalid={status === "error" ? true : undefined}
          aria-describedby={status === "error" ? `${fieldId}-error` : undefined}
          onChange={(event) => {
            setMessage(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={
            isBudget
              ? "Tamanho aproximado em cm, referências e o que imagina para a peça."
              : "Conte o que funcionou bem ou o que precisa melhorar."
          }
          className="resize-none rounded-xl border border-white/15 bg-[#1A1A1A]/80 px-4 py-3 text-sm leading-relaxed text-white placeholder-white/35 outline-none transition-colors focus:border-[var(--tb-panel-accent)] focus:ring-1 focus:ring-[var(--tb-panel-accent)]/40 disabled:opacity-50"
        />
      </div>

      {/* Honeypot: escondido de pessoas e de leitores de tela. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input
          id={`${fieldId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {status === "error" ? (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm font-medium text-[#FF9900]"
        >
          {feedbackMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[#121212] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
        style={{ backgroundColor: accentColor }}
      >
        {status === "loading" ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send aria-hidden="true" className="h-4 w-4" />
            {isBudget ? "Enviar pedido" : "Enviar feedback"}
          </>
        )}
      </button>

      <p className="text-[11px] leading-relaxed text-white/45">
        Usamos seu e-mail apenas para responder esta mensagem. Nada de spam e
        nenhum dado sensível é solicitado aqui.
      </p>
    </form>
  );
}
