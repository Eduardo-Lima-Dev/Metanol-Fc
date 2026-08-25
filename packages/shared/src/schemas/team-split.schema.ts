import { z } from "zod";
import { averageValueSchema } from "./player.schema";

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

// Resultado da partida (RF04 extra): times não têm identidade persistente
// entre divisões diferentes (o índice é recriado a cada geração), então o
// resultado é só "quem venceu nessa ocasião" — o ranking por jogador é quem
// agrega isso ao longo do tempo (ver teamSplitPlayerRankingEntrySchema).
export const teamSplitOutcomeSchema = z.enum(["team_win", "draw"]);
export type TeamSplitOutcome = z.infer<typeof teamSplitOutcomeSchema>;

export const recordTeamSplitResultSchema = z
  .object({
    outcome: teamSplitOutcomeSchema,
    // Obrigatório quando outcome = "team_win"; ignorado quando "draw".
    winningTeamIndex: z.number().int().min(0).optional(),
  })
  .refine((data) => data.outcome !== "team_win" || data.winningTeamIndex !== undefined, {
    message: "Informe o índice do time vencedor",
    path: ["winningTeamIndex"],
  });
export type RecordTeamSplitResultInput = z.infer<typeof recordTeamSplitResultSchema>;

// Gols/assistências de um jogador numa divisão de times específica (RF04
// extra — "acompanhar" um jogo pontual). `recordedByName` é resolvido pela
// API, não persistido.
export const teamSplitPlayerStatSchema = z.object({
  id: z.string().uuid(),
  teamSplitId: z.string().uuid(),
  playerId: z.string().uuid(),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  recordedBy: z.string().uuid(),
  recordedByName: z.string(),
  recordedAt: z.coerce.date(),
});
export type TeamSplitPlayerStat = z.infer<typeof teamSplitPlayerStatSchema>;

export const recordTeamSplitPlayerStatsSchema = z.object({
  entries: z
    .array(
      z.object({
        playerId: z.string().uuid(),
        goals: z.number().int().min(0),
        assists: z.number().int().min(0),
      }),
    )
    .min(1),
});
export type RecordTeamSplitPlayerStatsInput = z.infer<typeof recordTeamSplitPlayerStatsSchema>;

// Registro de histórico persistido a cada divisão gerada (RF04.1, RF05.7).
// `createdByName`/`resultRecordedByName` são resolvidos pela API, não
// persistidos — evita devolver só um UUID cru pra "quem fez a divisão".
export const teamSplitSchema = z.object({
  id: z.string().uuid(),
  rachaId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdByName: z.string(),
  createdAt: z.coerce.date(),
  params: teamSplitParamsSchema,
  teams: z.array(teamSchema),
  outcome: teamSplitOutcomeSchema.nullable(),
  winningTeamIndex: z.number().int().min(0).nullable(),
  resultRecordedBy: z.string().uuid().nullable(),
  resultRecordedByName: z.string().nullable(),
  resultRecordedAt: z.coerce.date().nullable(),
  playerStats: z.array(teamSplitPlayerStatSchema),
});
export type TeamSplit = z.infer<typeof teamSplitSchema>;

// Ranking de vitórias por jogador dentro de um racha (RF04 extra).
export const teamSplitPlayerRankingEntrySchema = z.object({
  playerId: z.string().uuid(),
  name: z.string(),
  wins: z.number().int().min(0),
});
export type TeamSplitPlayerRankingEntry = z.infer<typeof teamSplitPlayerRankingEntrySchema>;

// Jogador de entrada para o motor do AG isolado (sem vínculo com Racha/Player
// persistidos — atributos informados diretamente na requisição).
export const teamSplitPlayerInputSchema = z.object({
  id: z.string().min(1),
  average: averageValueSchema,
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
});
export type TeamSplitPlayerInput = z.infer<typeof teamSplitPlayerInputSchema>;

export const generateTeamSplitSchema = z
  .object({
    players: z.array(teamSplitPlayerInputSchema).min(1),
    params: teamSplitParamsSchema,
  })
  .refine((v) => v.players.length >= v.params.numberOfTeams, {
    message: "O número de jogadores deve ser ao menos igual ao número de times.",
    path: ["players"],
  })
  .refine((v) => new Set(v.players.map((p) => p.id)).size === v.players.length, {
    message: "IDs de jogadores duplicados.",
    path: ["players"],
  });
export type GenerateTeamSplitInput = z.infer<typeof generateTeamSplitSchema>;

export const teamSplitResultSchema = z.object({
  teams: z.array(teamSchema),
  bestFitness: z.number(),
  params: teamSplitParamsSchema,
});
export type TeamSplitResult = z.infer<typeof teamSplitResultSchema>;
