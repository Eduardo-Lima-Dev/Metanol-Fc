import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PlayersService } from "src/players/players.service";
import type {
  CreateRachaInput,
  RachaMemberRole,
  RachaWithRole,
  UpdateRachaInput,
} from "@metanol/shared";

@Injectable()
export class RachaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playersService: PlayersService,
  ) {}

  async create(userId: string, input: CreateRachaInput) {
    return this.prisma.$transaction(async (tx) => {
      const racha = await tx.racha.create({
        data: {
          name: input.name,
          schedule: input.schedule,
          createdBy: userId,
        },
      });

      await tx.rachaMember.create({
        data: { rachaId: racha.id, userId, role: "admin" },
      });
      await this.playersService.createForMember(racha.id, userId, tx);

      return racha;
    });
  }

  async findAllForUser(userId: string): Promise<RachaWithRole[]> {
    const memberships = await this.prisma.rachaMember.findMany({
      where: { userId },
      include: { racha: true },
      orderBy: { racha: { createdAt: "desc" } },
    });

    return memberships.map((membership) => ({
      ...membership.racha,
      schedule: membership.racha.schedule ?? undefined,
      role: membership.role,
    }));
  }

  async findOne(rachaId: string) {
    const racha = await this.prisma.racha.findUnique({ where: { id: rachaId } });
    if (!racha) throw new NotFoundException("Racha não encontrado");
    return racha;
  }

  async update(rachaId: string, input: UpdateRachaInput) {
    await this.findOne(rachaId);
    return this.prisma.racha.update({
      where: { id: rachaId },
      data: input,
    });
  }

  async setEvaluationsOpen(rachaId: string, open: boolean) {
    await this.findOne(rachaId);
    return this.prisma.racha.update({
      where: { id: rachaId },
      data: { evaluationsOpen: open },
    });
  }

  async addMember(rachaId: string, userId: string) {
    await this.findOne(rachaId);

    const existing = await this.prisma.rachaMember.findUnique({
      where: { rachaId_userId: { rachaId, userId } },
    });
    if (existing) throw new ConflictException("Usuário já participa deste racha");

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.rachaMember.create({
        data: { rachaId, userId, role: "member" },
      });
      await this.playersService.createForMember(rachaId, userId, tx);
      return member;
    });
  }

  async removeMember(rachaId: string, userId: string) {
    const membership = await this.getMembershipOrThrow(rachaId, userId);
    if (membership.role === "admin") {
      await this.assertNotLastAdmin(rachaId, userId);
    }

    await this.prisma.rachaMember.delete({
      where: { rachaId_userId: { rachaId, userId } },
    });
  }

  async setMemberRole(rachaId: string, userId: string, role: RachaMemberRole) {
    const membership = await this.getMembershipOrThrow(rachaId, userId);
    if (membership.role === "admin" && role === "member") {
      await this.assertNotLastAdmin(rachaId, userId);
    }

    return this.prisma.rachaMember.update({
      where: { rachaId_userId: { rachaId, userId } },
      data: { role },
    });
  }

  private async getMembershipOrThrow(rachaId: string, userId: string) {
    const membership = await this.prisma.rachaMember.findUnique({
      where: { rachaId_userId: { rachaId, userId } },
    });
    if (!membership) throw new NotFoundException("Membro não encontrado neste racha");
    return membership;
  }

  private async assertNotLastAdmin(rachaId: string, excludingUserId: string) {
    const otherAdmins = await this.prisma.rachaMember.count({
      where: { rachaId, role: "admin", userId: { not: excludingUserId } },
    });
    if (otherAdmins === 0) {
      throw new BadRequestException("O racha precisa de ao menos um administrador");
    }
  }
}
