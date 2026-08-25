import { z } from "zod";

// Papel dentro de um racha específico (RF02.4) — não é um papel global do usuário.
export const rachaMemberRoleSchema = z.enum(["admin", "member"]);
export type RachaMemberRole = z.infer<typeof rachaMemberRoleSchema>;

export const rachaMemberSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  userId: z.string().uuid(),
  role: rachaMemberRoleSchema,
  joinedAt: z.coerce.date(),
});
export type RachaMember = z.infer<typeof rachaMemberSchema>;

// Membro com os dados do usuário resolvidos — usado na tela de gerenciar
// membros do racha, que precisa exibir nome/e-mail junto do papel.
export const rachaMemberWithUserSchema = rachaMemberSchema.extend({
  name: z.string().min(1),
  nickname: z.string().min(1).optional(),
  email: z.string().email(),
});
export type RachaMemberWithUser = z.infer<typeof rachaMemberWithUserSchema>;

export const addRachaMemberSchema = z.object({
  rachaId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type AddRachaMemberInput = z.infer<typeof addRachaMemberSchema>;

export const removeRachaMemberSchema = z.object({
  rachaId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type RemoveRachaMemberInput = z.infer<typeof removeRachaMemberSchema>;

// Concessão de admin é unilateral por um admin existente (RF02.4) — sem aceite do promovido.
export const setRachaMemberRoleSchema = z.object({
  rachaId: z.string().uuid(),
  userId: z.string().uuid(),
  role: rachaMemberRoleSchema,
});
export type SetRachaMemberRoleInput = z.infer<typeof setRachaMemberRoleSchema>;
