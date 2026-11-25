import { z } from "zod";

export const waitlistRoleSchema = z.enum(["cliente", "tatuador"]);

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "O e-mail é muito curto.")
    .max(100, "O e-mail é muito longo.")
    .email("Por favor, insira um e-mail válido."),
  role: waitlistRoleSchema.optional().default("cliente"),
  website: z.string().optional(),
});

export type WaitlistRole = z.infer<typeof waitlistRoleSchema>;
export type WaitlistFormData = z.infer<typeof waitlistSchema>;