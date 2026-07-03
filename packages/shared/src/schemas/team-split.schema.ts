import { z } from "zod";

// Pesos de cada atributo na função de fitness (RF05.4, RF06.4).
export const teamSplitWeightsSchema = z.object({
  average: z.number().min(0),
  goals: z.number().min(0),
  assists: z.number().min(0),
});
export type TeamSplitWeights = z.infer<typeof teamSplitWeightsSchema>;

export const defaultTeamSplitWeights: TeamSplitWeights = {
  average: 1,
  goals: 1,
  assists: 1,
};

// Parâmetros do algoritmo genético (RF05.6) — valores padrão configuráveis.
export const geneticAlgorithmParamsSchema = z.object({
  populationSize: z.number().int().min(2),
  generations: z.number().int().min(1),
  crossoverRate: z.number().min(0).max(1),
  mutationRate: z.number().min(0).max(1),
});
export type GeneticAlgorithmParams = z.infer<typeof geneticAlgorithmParamsSchema>;

export const defaultGeneticAlgorithmParams: GeneticAlgorithmParams = {
  populationSize: 50,
  generations: 200,
  crossoverRate: 0.8,
  mutationRate: 0.05,
};

// Parâmetros de divisão informados pelo admin (RF06.1, RF06.2). A distribuição de
// jogadores excedentes (RF06.3 — um por time, round-robin) é regra de negócio da
// API, não validada aqui.
export const teamSplitParamsSchema = z.object({
  numberOfTeams: z.number().int().min(2),
  playersPerTeam: z.number().int().min(1),
  weights: teamSplitWeightsSchema.default(defaultTeamSplitWeights),
  algorithm: geneticAlgorithmParamsSchema.default(defaultGeneticAlgorithmParams),
});
export type TeamSplitParams = z.infer<typeof teamSplitParamsSchema>;

export const createTeamSplitSchema = z.object({
  rachaId: z.string().uuid(),
  presentPlayerIds: z.array(z.string().uuid()).min(1),
  params: teamSplitParamsSchema,
});
export type CreateTeamSplitInput = z.infer<typeof createTeamSplitSchema>;

export const teamSchema = z.object({
  index: z.number().int().min(0),
  playerIds: z.array(z.string().uuid()),
});
export type Team = z.infer<typeof teamSchema>;

// Registro de histórico persistido a cada divisão gerada (RF04.1, RF05.7).
export const teamSplitSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.coerce.date(),
  params: teamSplitParamsSchema,
  teams: z.array(teamSchema),
});
export type TeamSplit = z.infer<typeof teamSplitSchema>;
