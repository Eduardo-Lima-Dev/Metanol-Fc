import { z } from "zod";

export const averageValueSchema = z.number().min(0).max(5);

export const playerSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  // Nulo para jogador avulso (participa deste racha só por uma vez, sem
  // conta no sistema) — nesse caso `guestName` é quem identifica o jogador.
  userId: z.string().uuid().nullable(),
  guestName: z.string().min(1).nullable(),
  // Nome para exibição: o do usuário vinculado, ou `guestName` se avulso.
  name: z.string().min(1),
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

// Jogador avulso (RF03 extra): admin adiciona alguém que participa deste
// racha só naquela ocasião, sem conta no sistema — o overall é informado
// diretamente, já que não há avaliação pública nem histórico anteriores.
export const addGuestPlayerSchema = z.object({
  rachaId: z.string().uuid(),
  name: z.string().min(1),
  manualAverage: averageValueSchema.optional(),
});
export type AddGuestPlayerInput = z.infer<typeof addGuestPlayerSchema>;

// Atualização de gols/assistências — restrita a administradores do racha (RF03.3).
export const updatePlayerStatsSchema = z.object({
  goals: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
});
export type UpdatePlayerStatsInput = z.infer<typeof updatePlayerStatsSchema>;

// Colar o conteúdo do .txt de médias direto (alternativa ao upload de
// arquivo, RF03.4.1) — mesmo formato, mesma rota; `content` fica opcional
// aqui porque essa rota também aceita o upload multipart de arquivo, e nesse
// caso quem valida a presença de um dos dois é o controller.
export const importAveragesTextSchema = z.object({
  content: z.string().min(1).optional(),
});
export type ImportAveragesTextInput = z.infer<typeof importAveragesTextSchema>;

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
