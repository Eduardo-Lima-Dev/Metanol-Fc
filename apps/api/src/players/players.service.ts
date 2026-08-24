import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { Prisma } from "src/generated/prisma/client";

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
}
