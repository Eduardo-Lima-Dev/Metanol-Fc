import { z } from "zod";

export const averageValueSchema = z.number().min(0).max(5);

export const playerSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  userId: z.string().uuid(),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  // Valor importado via .txt pelo admin (RF03.4.1) — usado como fallback.
  manualAverage: averageValueSchema.nullable(),
  // Valor efetivo exibido/usado pelo sistema (RF03.4): mediana das avaliações
  // públicas quando existirem, senão cai para manualAverage; null se nenhuma
  // das duas fontes existir ainda.
  average: averageValueSchema.nullable(),
});
export type Player = z.infer<typeof playerSchema>;

// Atualização de gols/assistências — restrita a administradores do racha (RF03.3).
export const updatePlayerStatsSchema = z.object({
  goals: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
});
export type UpdatePlayerStatsInput = z.infer<typeof updatePlayerStatsSchema>;

// Upload de arquivo .txt com médias (RF03.4.1).
export const importPlayerAveragesSchema = z.object({
  rachaId: z.string().uuid(),
  entries: z
    .array(
      z.object({
        userId: z.string().uuid(),
        average: averageValueSchema,
      }),
    )
    .min(1),
});
export type ImportPlayerAveragesInput = z.infer<typeof importPlayerAveragesSchema>;
