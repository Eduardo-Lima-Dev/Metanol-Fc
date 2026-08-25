import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { resolveRachaId } from "../../racha/guards/racha-role.guard";

/**
 * Autorização de `POST .../team-splits/generate` (RF05 extra): admin do
 * racha sempre pode gerar; membro comum só pode quando o admin abriu a
 * geração pra todo mundo (`racha.teamSplitOpenToMembers`). Quem gerou e
 * quando ficam registrados no TeamSplit independente de quem chamou.
 */
@Injectable()
export class TeamSplitGenerateGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = (request as unknown as { user?: { id?: string } }).user?.id;
    const rachaId = resolveRachaId(request);

    if (!userId) throw new UnauthorizedException();
    if (!rachaId) throw new BadRequestException("rachaId ausente na requisição");

    const racha = await this.prisma.racha.findUnique({ where: { id: rachaId } });
    if (!racha) throw new NotFoundException("Racha não encontrado");

    const membership = await this.prisma.rachaMember.findUnique({
      where: { rachaId_userId: { rachaId, userId } },
    });
    if (!membership) throw new ForbiddenException("Você não participa deste racha");

    if (membership.role !== "admin" && !racha.teamSplitOpenToMembers) {
      throw new ForbiddenException(
        "Apenas o administrador pode gerar a divisão de times neste racha",
      );
    }

    return true;
  }
}
