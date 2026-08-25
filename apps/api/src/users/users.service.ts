import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";
import type { UpdateUserProfileInput } from "@metanol/shared";
import type { Users } from "src/generated/prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return this.toPublic(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("Usuário não encontrado");
    return this.toPublic(user);
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput) {
    if (input.nickname) {
      const existing = await this.prisma.users.findUnique({
        where: { nickname: input.nickname },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException("Apelido já está em uso");
      }
    }

    const user = await this.prisma.users.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.nickname !== undefined ? { nickname: input.nickname } : {}),
        ...(input.password !== undefined
          ? { password_hash: await bcrypt.hash(input.password, 12) }
          : {}),
      },
    });

    return this.toPublic(user);
  }

  private toPublic(user: Users) {
    return {
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
