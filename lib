import { z } from "zod";

export const waitlistSchema = z.object({
  email: z
    .string()
    .email("Por favor, insira um e-mail válido.")
    .min(5, "O e-mail é muito curto.")
    .max(100, "O e-mail é muito longo.")
    .transform((email) => email.toLowerCase().trim()), // Segurança e padronização
});

export type WaitlistFormData = z.infer<typeof waitlistSchema>;