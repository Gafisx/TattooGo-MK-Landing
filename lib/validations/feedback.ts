import { z } from "zod";

/** Tipos de mensagem aceitos pela gaveta de ações da barra superior. */
export const feedbackKindSchema = z.enum(["feedback", "budget"]);

export const feedbackCategorySchema = z.enum([
  "elogio",
  "sugestao",
  "problema",
  "orcamento",
]);

export const feedbackContextSchema = z.enum([
  "landing",
  "download",
  "clientes",
  "tatuadores",
  "support",
]);

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "O e-mail é muito curto.")
  .max(100, "O e-mail é muito longo.")
  .email("Por favor, insira um e-mail válido.");

const messageField = z
  .string()
  .trim()
  .min(10, "Escreva ao menos 10 caracteres para nos ajudar a entender.")
  .max(1200, "A mensagem pode ter no máximo 1200 caracteres.");

export const feedbackSchema = z.object({
  kind: feedbackKindSchema,
  email: emailField,
  message: messageField,
  category: feedbackCategorySchema.optional(),
  context: feedbackContextSchema.optional(),
  style: z.string().trim().max(40, "Estilo muito longo.").optional(),
  placement: z.string().trim().max(60, "Local muito longo.").optional(),
  /** Honeypot anti-bot, invisível para pessoas. */
  website: z.string().optional(),
});

export type FeedbackKind = z.infer<typeof feedbackKindSchema>;
export type FeedbackCategory = z.infer<typeof feedbackCategorySchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
