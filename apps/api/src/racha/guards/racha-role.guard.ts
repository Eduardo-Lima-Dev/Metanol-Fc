import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Type,
  UnauthorizedException,
  mixin,
} from "@nestjs/common";
import type { Request } from "express";
import type { RachaMemberRole } from "@metanol/shared";
import { PrismaService } from "../../prisma/prisma.service";

export function resolveRachaId(request: Request): string | undefined {
  const params = request.params as Record<string, string | undefined>;
  const body = request.body as Record<string, unknown> | undefined;
  return params?.rachaId ?? (body?.rachaId as string | undefined);
}

/**
 * Guard de autorização por papel no racha (RNF02.6). É uma factory (mixin)
 * para ser reutilizada em RF02/RF03/RF05 sem duplicar a checagem: cada rota
 * escolhe o papel mínimo exigido (`member` para leitura, `admin` para
 * escrita administrativa). Sempre usado depois de `JwtAuthGuard`.
 */
export function RachaRoleGuard(minRole: RachaMemberRole): Type<CanActivate> {
  @Injectable()
  class RachaRoleGuardMixin implements CanActivate {
    constructor(private readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const userId = (request as unknown as { user?: { id?: string } }).user?.id;
      const rachaId = resolveRachaId(request);

      if (!userId) throw new UnauthorizedException();
      if (!rachaId) throw new BadRequestException("rachaId ausente na requisição");

      const membership = await this.prisma.rachaMember.findUnique({
        where: { rachaId_userId: { rachaId, userId } },
      });

      if (!membership) throw new ForbiddenException("Você não participa deste racha");
      if (minRole === "admin" && membership.role !== "admin") {
        throw new ForbiddenException("Apenas administradores do racha podem executar esta ação");
      }

      return true;
    }
  }

  return mixin(RachaRoleGuardMixin);
}

export const RachaMemberGuard = RachaRoleGuard("member");
export const RachaAdminGuard = RachaRoleGuard("admin");
