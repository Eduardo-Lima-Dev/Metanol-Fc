import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { Prisma } from "src/generated/prisma/client";
import type { AddGuestPlayerInput, Player, UpdatePlayerStatsInput } from "@metanol/shared";
import { median } from "./median";
import { parsePlayerAveragesFile } from "./player-averages-parser";

export interface ImportAveragesResult {
  line: number;
  identifier?: string;
  status: "ok" | "error";
  message?: string;
}

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  createForMember(
    rachaId: string,
    userId: string,
    tx: PrismaService | Prisma.TransactionClient = this.prisma,
  ) {
    return tx.player.create({
      data: { rachaId, userId },
    });
  }

  /**
   * Média efetiva (RF03.4): mediana das avaliações públicas recebidas por
   * cada jogador, com fallback para `manualAverage` quando não há avaliação
   * nenhuma. Reaproveitado pela integração do RF05 (Etapa 4) para não
   * duplicar essa regra na hora de montar os jogadores presentes.
   */
  async computeEffectiveAverages(
    rachaId: string,
    playerIds?: string[],
  ): Promise<Map<string, number | null>> {
    const players = await this.prisma.player.findMany({
      where: { rachaId, ...(playerIds ? { id: { in: playerIds } } : {}) },
      select: { id: true, manualAverage: true },
    });

    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        rachaId,
        evaluatedPlayerId: { in: players.map((player) => player.id) },
        score: { not: null },
      },
      select: { evaluatedPlayerId: true, score: true },
    });

    const scoresByPlayer = new Map<string, number[]>();
    for (const evaluation of evaluations) {
      // `score` não é nulo aqui — filtrado na query (abstenções não contam
      // para a mediana).
      const scores = scoresByPlayer.get(evaluation.evaluatedPlayerId) ?? [];
      scores.push(evaluation.score as number);
      scoresByPlayer.set(evaluation.evaluatedPlayerId, scores);
    }

    const averages = new Map<string, number | null>();
    for (const player of players) {
      const scores = scoresByPlayer.get(player.id) ?? [];
      averages.set(player.id, median(scores) ?? player.manualAverage ?? null);
    }
    return averages;
  }

  /**
   * Gols/assistências de cada jogador por partida (RF04 extra — "acompanhar"
   * um jogo pontual), somados ao valor manual de base guardado em
   * Player.goals/assists. Mesmo espírito de `computeEffectiveAverages`:
   * o total exibido é dinâmico, dá pra corrigir só o jogo de uma data
   * específica sem afetar as outras.
   */
  async computeMatchStatsTotals(
    rachaId: string,
    playerIds?: string[],
  ): Promise<Map<string, { goals: number; assists: number }>> {
    const stats = await this.prisma.teamSplitPlayerStat.findMany({
      where: {
        player: { rachaId },
        ...(playerIds ? { playerId: { in: playerIds } } : {}),
      },
      select: { playerId: true, goals: true, assists: true },
    });

    const totals = new Map<string, { goals: number; assists: number }>();
    for (const stat of stats) {
      const current = totals.get(stat.playerId) ?? { goals: 0, assists: 0 };
      totals.set(stat.playerId, {
        goals: current.goals + stat.goals,
        assists: current.assists + stat.assists,
      });
    }
    return totals;
  }

  async listPlayers(rachaId: string): Promise<Player[]> {
    const players = await this.prisma.player.findMany({
      where: { rachaId },
      include: { user: { select: { name: true } } },
    });
    const averages = await this.computeEffectiveAverages(rachaId);
    const matchStatsTotals = await this.computeMatchStatsTotals(rachaId);

    return players.map(({ user, ...player }) => {
      const matchStats = matchStatsTotals.get(player.id);
      return {
        ...player,
        name: user?.name ?? player.guestName ?? "Jogador",
        goals: player.goals + (matchStats?.goals ?? 0),
        assists: player.assists + (matchStats?.assists ?? 0),
        average: averages.get(player.id) ?? null,
      };
    });
  }

  /**
   * Jogador avulso (RF03 extra): participa deste racha só nesta ocasião, sem
   * conta no sistema. O admin informa o overall diretamente (`manualAverage`)
   * já que não há avaliação pública nem histórico anteriores para ele.
   */
  async addGuestPlayer(rachaId: string, input: Omit<AddGuestPlayerInput, "rachaId">) {
    return this.prisma.player.create({
      data: {
        rachaId,
        guestName: input.name,
        manualAverage: input.manualAverage,
      },
    });
  }

  async updateStats(rachaId: string, playerId: string, input: UpdatePlayerStatsInput) {
    await this.getPlayerOrThrow(rachaId, playerId);
    return this.prisma.player.update({
      where: { id: playerId },
      data: input,
    });
  }

  async importAverages(rachaId: string, fileContent: string): Promise<ImportAveragesResult[]> {
    const parsedLines = parsePlayerAveragesFile(fileContent);
    const results: ImportAveragesResult[] = [];

    for (const parsed of parsedLines) {
      if (parsed.error || parsed.average === undefined) {
        results.push({ line: parsed.line, identifier: parsed.identifier, status: "error", message: parsed.error });
        continue;
      }

      const user = await this.prisma.users.findFirst({
        where: { OR: [{ email: parsed.identifier }, { nickname: parsed.identifier }] },
      });
      if (!user) {
        results.push({
          line: parsed.line,
          identifier: parsed.identifier,
          status: "error",
          message: "Usuário não encontrado",
        });
        continue;
      }

      const player = await this.prisma.player.findUnique({
        where: { rachaId_userId: { rachaId, userId: user.id } },
      });
      if (!player) {
        results.push({
          line: parsed.line,
          identifier: parsed.identifier,
          status: "error",
          message: "Jogador não participa deste racha",
        });
        continue;
      }

      await this.prisma.player.update({
        where: { id: player.id },
        data: { manualAverage: parsed.average },
      });
      results.push({ line: parsed.line, identifier: parsed.identifier, status: "ok" });
    }

    return results;
  }

  private async getPlayerOrThrow(rachaId: string, playerId: string) {
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player || player.rachaId !== rachaId) {
      throw new NotFoundException("Jogador não encontrado neste racha");
    }
    return player;
  }
}
