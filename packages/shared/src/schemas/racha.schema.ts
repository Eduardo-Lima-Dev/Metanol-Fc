import { z } from "zod";

export const rachaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  // dia/horário do racha (RF02.1); texto livre por ora (ex.: "Terças, 20h").
  schedule: z.string().min(1).optional(),
  // controla se a avaliação pública de jogadores (RF03.4.2) está aberta para preenchimento.
  evaluationsOpen: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.coerce.date(),
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
