import { z } from "zod";
import { averageValueSchema } from "./player.schema";

export const evaluationSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  evaluatedPlayerId: z.string().uuid(),
  evaluatorPlayerId: z.string().uuid(),
  score: averageValueSchema,
  createdAt: z.coerce.date(),
});
export type Evaluation = z.infer<typeof evaluationSchema>;

// Não há schema de atualização: avaliação é imutável após o envio (RF03.4.2).
export const createEvaluationSchema = z
  .object({
    rachaId: z.string().uuid(),
    evaluatedPlayerId: z.string().uuid(),
    evaluatorPlayerId: z.string().uuid(),
    score: averageValueSchema,
  })
  .refine((data) => data.evaluatedPlayerId !== data.evaluatorPlayerId, {
    message: "Um jogador não pode avaliar a si mesmo",
    path: ["evaluatedPlayerId"],
  });
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
