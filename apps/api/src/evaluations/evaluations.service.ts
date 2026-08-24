import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { CreateEvaluationInput } from "@metanol/shared";

type CreateEvaluationBody = Omit<CreateEvaluationInput, "rachaId" | "evaluatorPlayerId">;

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(rachaId: string, evaluatorUserId: string, input: CreateEvaluationBody) {
    const racha = await this.prisma.racha.findUnique({ where: { id: rachaId } });
    if (!racha) throw new NotFoundException("Racha não encontrado");
    if (!racha.evaluationsOpen) {
      throw new ForbiddenException("A avaliação pública deste racha não está aberta");
    }

    const evaluatorPlayer = await this.prisma.player.findUnique({
      where: { rachaId_userId: { rachaId, userId: evaluatorUserId } },
    });
    if (!evaluatorPlayer) throw new NotFoundException("Jogador avaliador não encontrado neste racha");

    const evaluatedPlayer = await this.prisma.player.findUnique({
      where: { id: input.evaluatedPlayerId },
    });
    if (!evaluatedPlayer || evaluatedPlayer.rachaId !== rachaId) {
      throw new BadRequestException("Jogador avaliado não pertence a este racha");
    }

    if (evaluatorPlayer.id === evaluatedPlayer.id) {
      throw new BadRequestException("Um jogador não pode avaliar a si mesmo");
    }

    const existing = await this.prisma.evaluation.findUnique({
      where: {
        rachaId_evaluatedPlayerId_evaluatorPlayerId: {
          rachaId,
          evaluatedPlayerId: evaluatedPlayer.id,
          evaluatorPlayerId: evaluatorPlayer.id,
        },
      },
    });
    if (existing) throw new ConflictException("Você já avaliou este jogador");

    return this.prisma.evaluation.create({
      data: {
        rachaId,
        evaluatedPlayerId: evaluatedPlayer.id,
        evaluatorPlayerId: evaluatorPlayer.id,
        score: input.score,
      },
    });
  }
}
