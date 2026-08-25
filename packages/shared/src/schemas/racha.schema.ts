import { z } from "zod";
import { rachaMemberRoleSchema } from "./racha-member.schema";

export const rachaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  // dia/horário do racha (RF02.1); texto livre por ora (ex.: "Terças, 20h").
  schedule: z.string().min(1).optional(),
  // controla se a avaliação pública de jogadores (RF03.4.2) está aberta para preenchimento.
  evaluationsOpen: z.boolean(),
  // quando true, qualquer membro (não só o admin) pode gerar uma divisão de
  // times (RF05 extra).
  teamSplitOpenToMembers: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.coerce.date(),
  // Código do link de convite (RF02 extra) — quem tiver esse código entra
  // como membro automaticamente ao se cadastrar/logar pelo link.
  inviteCode: z.string().uuid(),
});
export type Racha = z.infer<typeof rachaSchema>;

export const createRachaSchema = z.object({
  name: z.string().min(1),
  schedule: z.string().min(1).optional(),
});
export type CreateRachaInput = z.infer<typeof createRachaSchema>;

export const updateRachaSchema = z.object({
  name: z.string().min(1).optional(),
  schedule: z.string().min(1).optional(),
});
export type UpdateRachaInput = z.infer<typeof updateRachaSchema>;

export const setEvaluationsOpenSchema = z.object({
  rachaId: z.string().uuid(),
  open: z.boolean(),
});
export type SetEvaluationsOpenInput = z.infer<typeof setEvaluationsOpenSchema>;

export const setTeamSplitOpenToMembersSchema = z.object({
  rachaId: z.string().uuid(),
  open: z.boolean(),
});
export type SetTeamSplitOpenToMembersInput = z.infer<
  typeof setTeamSplitOpenToMembersSchema
>;

// Racha listado para um usuário (RF02.5), com o papel que ele exerce nele.
export const rachaWithRoleSchema = rachaSchema.extend({
  role: rachaMemberRoleSchema,
});
export type RachaWithRole = z.infer<typeof rachaWithRoleSchema>;
