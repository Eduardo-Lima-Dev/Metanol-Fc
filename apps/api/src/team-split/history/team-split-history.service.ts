import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { Prisma } from "src/generated/prisma/client";
import type { PaginationQuery, Team, TeamSplitParams } from "@metanol/shared";

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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.teamSplit.count({ where: { rachaId } }),
    ]);

    return { items, page, pageSize, total };
  }

  async findOne(rachaId: string, teamSplitId: string) {
    const teamSplit = await this.prisma.teamSplit.findUnique({ where: { id: teamSplitId } });
    if (!teamSplit || teamSplit.rachaId !== rachaId) {
      throw new NotFoundException("Divisão de times não encontrada neste racha");
    }
    return teamSplit;
  }
}
