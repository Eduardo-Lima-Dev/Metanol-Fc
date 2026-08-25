import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { Prisma } from "src/generated/prisma/client";
import type { Player, UpdatePlayerStatsInput } from "@metanol/shared";
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
      where: { rachaId, evaluatedPlayerId: { in: players.map((player) => player.id) } },
      select: { evaluatedPlayerId: true, score: true },
    });

    const scoresByPlayer = new Map<string, number[]>();
    for (const evaluation of evaluations) {
      const scores = scoresByPlayer.get(evaluation.evaluatedPlayerId) ?? [];
      scores.push(evaluation.score);
      scoresByPlayer.set(evaluation.evaluatedPlayerId, scores);
    }

    const averages = new Map<string, number | null>();
    for (const player of players) {
      const scores = scoresByPlayer.get(player.id) ?? [];
      averages.set(player.id, median(scores) ?? player.manualAverage ?? null);
    }
    return averages;
  }

  async listPlayers(rachaId: string): Promise<Player[]> {
    const players = await this.prisma.player.findMany({ where: { rachaId } });
    const averages = await this.computeEffectiveAverages(rachaId);

    return players.map((player) => ({
      ...player,
      average: averages.get(player.id) ?? null,
    }));
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
