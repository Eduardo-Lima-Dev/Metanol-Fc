import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "../../generated/prisma/client";
import type {
  PaginationQuery,
  RecordTeamSplitPlayerStatsInput,
  RecordTeamSplitResultInput,
  Team,
  TeamSplitParams,
  TeamSplitPlayerRankingEntry,
} from "@metanol/shared";

const teamSplitInclude = {
  creator: { select: { name: true } },
  resultRecordedByUser: { select: { name: true } },
  playerStats: {
    include: { recordedByUser: { select: { name: true } } },
  },
} satisfies Prisma.TeamSplitInclude;

type TeamSplitWithNames = Prisma.TeamSplitGetPayload<{ include: typeof teamSplitInclude }>;

@Injectable()
export class TeamSplitHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(
    rachaId: string,
    createdBy: string,
    params: TeamSplitParams,
    teams: Team[],
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    return tx.teamSplit.create({
      data: { rachaId, createdBy, params, teams },
    });
  }

  async findMany(rachaId: string, pagination: PaginationQuery) {
    const { page, pageSize } = pagination;

    const [items, total] = await Promise.all([
      this.prisma.teamSplit.findMany({
        where: { rachaId },
        include: teamSplitInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.teamSplit.count({ where: { rachaId } }),
    ]);

    return { items: items.map((item) => this.toResponse(item)), page, pageSize, total };
  }

  async findOne(rachaId: string, teamSplitId: string) {
    const teamSplit = await this.getOrThrow(rachaId, teamSplitId);
    return this.toResponse(teamSplit);
  }

  async recordResult(
    rachaId: string,
    teamSplitId: string,
    recordedBy: string,
    input: RecordTeamSplitResultInput,
  ) {
    const teamSplit = await this.getOrThrow(rachaId, teamSplitId);

    // O schema garante (via .refine) que winningTeamIndex vem preenchido
    // quando outcome é "team_win" — o `?? null` só satisfaz o tipo do Prisma.
    let winningTeamIndex: number | null = null;
    if (input.outcome === "team_win") {
      winningTeamIndex = input.winningTeamIndex ?? null;
      const teams = teamSplit.teams as unknown as Team[];
      const validIndices = new Set(teams.map((team) => team.index));
      if (winningTeamIndex === null || !validIndices.has(winningTeamIndex)) {
        throw new BadRequestException("Índice de time vencedor inválido para esta divisão");
      }
    }

    const updated = await this.prisma.teamSplit.update({
      where: { id: teamSplitId },
      data: {
        outcome: input.outcome,
        winningTeamIndex,
        resultRecordedBy: recordedBy,
        resultRecordedAt: new Date(),
      },
      include: teamSplitInclude,
    });

    return this.toResponse(updated);
  }

  /**
   * Gols/assistências por jogador numa divisão específica (RF04 extra —
   * "acompanhar" um jogo pontual). Upsert por jogador: reenviar o mesmo jogo
   * corrige os números daquela partida sem duplicar registro nem afetar as
   * outras. Só jogadores que de fato participaram desta divisão (presentes
   * em algum time) podem ter estatística registrada aqui.
   */
  async recordPlayerStats(
    rachaId: string,
    teamSplitId: string,
    recordedBy: string,
    input: RecordTeamSplitPlayerStatsInput,
  ) {
    const teamSplit = await this.getOrThrow(rachaId, teamSplitId);

    const teams = teamSplit.teams as unknown as Team[];
    const validPlayerIds = new Set(teams.flatMap((team) => team.playerIds));
    for (const entry of input.entries) {
      if (!validPlayerIds.has(entry.playerId)) {
        throw new BadRequestException(
          "Um ou mais jogadores informados não participaram desta divisão",
        );
      }
    }

    await this.prisma.$transaction(
      input.entries.map((entry) =>
        this.prisma.teamSplitPlayerStat.upsert({
          where: { teamSplitId_playerId: { teamSplitId, playerId: entry.playerId } },
          create: {
            teamSplitId,
            playerId: entry.playerId,
            goals: entry.goals,
            assists: entry.assists,
            recordedBy,
          },
          update: {
            goals: entry.goals,
            assists: entry.assists,
            recordedBy,
            recordedAt: new Date(),
          },
        }),
      ),
    );

    return this.findOne(rachaId, teamSplitId);
  }

  /**
   * Ranking de vitórias por jogador (RF04 extra): como o índice do time é
   * recriado a cada geração (sem identidade persistente entre divisões
   * diferentes), a única forma de agregar "quem venceu mais" ao longo do
   * tempo é por jogador, não por time.
   */
  async getPlayerRanking(rachaId: string): Promise<TeamSplitPlayerRankingEntry[]> {
    const winningSplits = await this.prisma.teamSplit.findMany({
      where: { rachaId, outcome: "team_win" },
      select: { teams: true, winningTeamIndex: true },
    });

    const winsByPlayerId = new Map<string, number>();
    for (const split of winningSplits) {
      const teams = split.teams as unknown as Team[];
      const winningTeam = teams.find((team) => team.index === split.winningTeamIndex);
      if (!winningTeam) continue;
      for (const playerId of winningTeam.playerIds) {
        winsByPlayerId.set(playerId, (winsByPlayerId.get(playerId) ?? 0) + 1);
      }
    }

    if (winsByPlayerId.size === 0) return [];

    const players = await this.prisma.player.findMany({
      where: { id: { in: [...winsByPlayerId.keys()] } },
      include: { user: { select: { name: true } } },
    });

    return players
      .map((player) => ({
        playerId: player.id,
        name: player.user?.name ?? player.guestName ?? "Jogador",
        wins: winsByPlayerId.get(player.id) ?? 0,
      }))
      .sort((a, b) => b.wins - a.wins);
  }

  private async getOrThrow(rachaId: string, teamSplitId: string) {
    const teamSplit = await this.prisma.teamSplit.findUnique({
      where: { id: teamSplitId },
      include: teamSplitInclude,
    });
    if (!teamSplit || teamSplit.rachaId !== rachaId) {
      throw new NotFoundException("Divisão de times não encontrada neste racha");
    }
    return teamSplit;
  }

  private toResponse(teamSplit: TeamSplitWithNames) {
    const { creator, resultRecordedByUser, playerStats, ...rest } = teamSplit;
    return {
      ...rest,
      createdByName: creator.name,
      resultRecordedByName: resultRecordedByUser?.name ?? null,
      playerStats: playerStats.map(({ recordedByUser, ...stat }) => ({
        ...stat,
        recordedByName: recordedByUser.name,
      })),
    };
  }
}
